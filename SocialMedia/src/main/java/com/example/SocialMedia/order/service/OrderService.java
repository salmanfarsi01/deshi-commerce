package com.example.SocialMedia.order.service;

import com.example.SocialMedia.address.model.Address;
import com.example.SocialMedia.address.service.AddressService;
import com.example.SocialMedia.auth.service.AuthService;
import com.example.SocialMedia.cart.model.Cart;
import com.example.SocialMedia.cart.model.CartItem;
import com.example.SocialMedia.cart.service.CartService;
import com.example.SocialMedia.common.exception.BadRequestException;
import com.example.SocialMedia.common.exception.ConflictException;
import com.example.SocialMedia.common.exception.ResourceNotFoundException;
import com.example.SocialMedia.common.exception.UnauthorizedException;
import com.example.SocialMedia.order.dto.*;
import com.example.SocialMedia.order.model.Order;
import com.example.SocialMedia.order.model.OrderItem;
import com.example.SocialMedia.order.model.OrderStatus;
import com.example.SocialMedia.order.repository.OrderRepository;
import com.example.SocialMedia.payment.dto.PaymentResponse;
import com.example.SocialMedia.payment.model.PaymentMethod;
import com.example.SocialMedia.payment.model.PaymentStatus;
import com.example.SocialMedia.payment.service.PaymentService;
import com.example.SocialMedia.product.model.Product;
import com.example.SocialMedia.product.service.ProductService;
import com.example.SocialMedia.user.model.Role;
import com.example.SocialMedia.user.model.User;
import com.example.SocialMedia.common.service.DeliveryService;
import com.example.SocialMedia.admin.dto.CustomerOrderTrackingSummary;
import com.example.SocialMedia.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final AddressService addressService;
    private final ProductService productService;
    private final PaymentService paymentService;
    private final AuthService authService;
    private final DeliveryService deliveryService;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        CartService cartService,
                        AddressService addressService,
                        ProductService productService,
                        PaymentService paymentService,
                        AuthService authService,
                        DeliveryService deliveryService,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.addressService = addressService;
        this.productService = productService;
        this.paymentService = paymentService;
        this.authService = authService;
        this.deliveryService = deliveryService;
        this.userRepository = userRepository;
    }

    public OrderResponse createOrder(String authHeader, CreateOrderRequest request) {
        User user = authService.getAuthenticatedUser(authHeader);

        // 1. Validate delivery address
        Address address = addressService.getRawAddress(request.getAddressId(), user.getId());

        // 2. Load Cart
        Cart cart = cartService.getRawCart(user.getId());
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot create an order with an empty cart");
        }

        // 3. Re-verify products and stock availability
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal calculatedSubtotal = BigDecimal.ZERO;

        for (CartItem ci : cart.getItems()) {
            Product product = productService.getRawProduct(ci.getProductId());
            if (!product.isAvailable() || product.getStock() < ci.getQuantity()) {
                throw new ConflictException("Product '" + product.getName() + "' does not have sufficient stock (Available: " + product.getStock() + ")");
            }

            BigDecimal effectivePrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            String orderItemId = "oi_" + UUID.randomUUID().toString().substring(0, 8);
            OrderItem orderItem = new OrderItem(orderItemId, product.getId(), product.getName(), effectivePrice, ci.getQuantity());
            orderItems.add(orderItem);

            calculatedSubtotal = calculatedSubtotal.add(orderItem.getSubtotal());
        }

        // 4. Calculate Delivery Charge (Inside Dhaka vs Outside Dhaka, free over threshold)
        BigDecimal deliveryCharge = deliveryService.calculateDeliveryCharge(
                calculatedSubtotal,
                address.getDistrict(),
                address.getDivision()
        );
        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal total = calculatedSubtotal.add(deliveryCharge).subtract(discount);

        // 5. Reserve / Decrease stock
        for (OrderItem item : orderItems) {
            productService.decreaseStock(item.getProductId(), item.getQuantity());
        }

        // 6. Determine initial status
        OrderStatus initialStatus = OrderStatus.PENDING;
        PaymentStatus initialPaymentStatus = request.getPaymentMethod() == PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.INITIATED;

        String orderId = "ord_" + UUID.randomUUID().toString().substring(0, 8);
        String orderNumber = "BD-" + System.currentTimeMillis() % 100000000;

        Order order = new Order(
                orderId,
                orderNumber,
                user.getId(),
                orderItems,
                calculatedSubtotal,
                deliveryCharge,
                discount,
                total,
                "BDT",
                address,
                request.getPaymentMethod(),
                initialPaymentStatus,
                initialStatus,
                request.getNotes()
        );

        orderRepository.save(order);

        // 7. Initiate payment record
        PaymentResponse paymentResponse = paymentService.initiatePayment(
                order.getId(),
                user.getId(),
                total,
                request.getPaymentMethod(),
                address.getPhone(),
                address.getName()
        );

        // 8. Clear Cart
        cartService.clearCart(authHeader);

        return OrderResponse.fromEntity(order, paymentResponse);
    }

    public List<OrderResponse> getUserOrders(String authHeader) {
        User user = authService.getAuthenticatedUser(authHeader);
        return orderRepository.findByUserId(user.getId()).stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(String authHeader, String orderId) {
        User user = authService.getAuthenticatedUser(authHeader);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUserId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You are not authorized to view this order");
        }

        return toOrderResponse(order);
    }

    public OrderResponse cancelOrder(String authHeader, String orderId, CancelOrderRequest request) {
        User user = authService.getAuthenticatedUser(authHeader);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUserId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You are not authorized to cancel this order");
        }

        if (!order.getStatus().canTransitionTo(OrderStatus.CANCELLED)) {
            throw new BadRequestException("Order cannot be cancelled in its current state (" + order.getStatus() + ")");
        }

        // Restore stock
        for (OrderItem item : order.getItems()) {
            productService.restoreStock(item.getProductId(), item.getQuantity());
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(Instant.now());
        if (request != null && request.getReason() != null) {
            order.setNotes((order.getNotes() != null ? order.getNotes() + " | " : "") + "Cancelled: " + request.getReason());
        }
        orderRepository.save(order);

        return toOrderResponse(order);
    }

    public List<OrderResponse> getAllOrdersAdmin(OrderStatus status) {
        return getAllOrdersAdmin(status, null, null);
    }

    public List<OrderResponse> getAllOrdersAdmin(OrderStatus status, String userId, String search) {
        List<Order> orders = orderRepository.findWithFilter(status, userId, search);

        return orders.stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    public CustomerOrderTrackingSummary getCustomerOrderSummaryAdmin(String customerUserId) {
        User customer = userRepository.findById(customerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerUserId));

        List<Order> customerOrders = orderRepository.findByUserId(customerUserId);
        List<OrderResponse> responseList = customerOrders.stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());

        BigDecimal totalSpent = customerOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getStatus() != OrderStatus.FAILED)
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int pendingCount = (int) customerOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING || o.getStatus() == OrderStatus.PROCESSING || o.getStatus() == OrderStatus.CONFIRMED)
                .count();

        int deliveredCount = (int) customerOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .count();

        return new CustomerOrderTrackingSummary(
                customer.getId(),
                customer.getName(),
                customer.getPhone(),
                customer.getEmail(),
                customerOrders.size(),
                totalSpent,
                pendingCount,
                deliveredCount,
                responseList
        );
    }

    public OrderResponse updateOrderTrackingAdmin(String orderId, OrderTrackingUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setCourierName(request.getCourierName());
        order.setTrackingNumber(request.getTrackingNumber());
        if (request.getTrackingUrl() != null && !request.getTrackingUrl().isBlank()) {
            order.setTrackingUrl(request.getTrackingUrl());
        } else {
            // Auto generate standard tracking url if Steadfast / Pathao
            if ("steadfast".equalsIgnoreCase(request.getCourierName())) {
                order.setTrackingUrl("https://steadfast.com.bd/tracking/" + request.getTrackingNumber());
            } else if ("pathao".equalsIgnoreCase(request.getCourierName())) {
                order.setTrackingUrl("https://merchant.pathao.com/tracking?consignment_id=" + request.getTrackingNumber());
            }
        }
        order.setEstimatedDeliveryDate(request.getEstimatedDeliveryDate());

        // Update status to SHIPPED if currently in CONFIRMED or PROCESSING
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        } else if (order.getStatus() == OrderStatus.CONFIRMED || order.getStatus() == OrderStatus.PROCESSING) {
            order.setStatus(OrderStatus.SHIPPED);
        }

        if (request.getNote() != null && !request.getNote().isBlank()) {
            order.setNotes((order.getNotes() != null ? order.getNotes() + " | " : "") + request.getNote());
        }

        order.setUpdatedAt(Instant.now());
        orderRepository.save(order);

        return toOrderResponse(order);
    }

    public OrderResponse confirmOrderPayment(String orderId, String transactionId, PaymentStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setPaymentStatus(status);
        if (status == PaymentStatus.SUCCESS) {
            order.setStatus(OrderStatus.CONFIRMED);
            order.setNotes((order.getNotes() != null ? order.getNotes() + " | " : "") + "Paid via SSLCommerz: " + transactionId);
        } else if (status == PaymentStatus.FAILED) {
            order.setNotes((order.getNotes() != null ? order.getNotes() + " | " : "") + "SSLCommerz Payment Failed: " + transactionId);
        }
        order.setUpdatedAt(Instant.now());
        orderRepository.save(order);

        return toOrderResponse(order);
    }

    public OrderResponse updateOrderStatusAdmin(String orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getStatus().canTransitionTo(request.getStatus())) {
            throw new BadRequestException(
                    String.format("Invalid order status transition from %s to %s. Allowed transitions: %s",
                            order.getStatus(), request.getStatus(), order.getStatus())
            );
        }

        // If transitioning to CANCELLED or FAILED, restore stock
        if (request.getStatus() == OrderStatus.CANCELLED || request.getStatus() == OrderStatus.FAILED) {
            for (OrderItem item : order.getItems()) {
                productService.restoreStock(item.getProductId(), item.getQuantity());
            }
        }

        // If DELIVERED and COD, mark payment SUCCESS
        if (request.getStatus() == OrderStatus.DELIVERED && order.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.SUCCESS);
        }

        order.setStatus(request.getStatus());
        order.setUpdatedAt(Instant.now());
        if (request.getComment() != null) {
            order.setNotes((order.getNotes() != null ? order.getNotes() + " | " : "") + request.getComment());
        }
        orderRepository.save(order);

        return toOrderResponse(order);
    }

    private OrderResponse toOrderResponse(Order order) {
        PaymentResponse paymentResponse = null;
        try {
            paymentResponse = paymentService.getPaymentByOrderId(order.getId());
        } catch (Exception ignored) {
        }
        return OrderResponse.fromEntity(order, paymentResponse);
    }
}
