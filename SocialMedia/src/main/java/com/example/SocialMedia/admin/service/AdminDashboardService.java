package com.example.SocialMedia.admin.service;

import com.example.SocialMedia.admin.dto.DashboardSummaryResponse;
import com.example.SocialMedia.common.exception.ResourceNotFoundException;
import com.example.SocialMedia.order.model.Order;
import com.example.SocialMedia.order.model.OrderStatus;
import com.example.SocialMedia.order.repository.OrderRepository;
import com.example.SocialMedia.payment.model.PaymentStatus;
import com.example.SocialMedia.product.model.Product;
import com.example.SocialMedia.product.repository.ProductRepository;
import com.example.SocialMedia.user.dto.UserProfileResponse;
import com.example.SocialMedia.user.model.Role;
import com.example.SocialMedia.user.model.User;
import com.example.SocialMedia.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public AdminDashboardService(OrderRepository orderRepository,
                                 ProductRepository productRepository,
                                 UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public DashboardSummaryResponse getDashboardSummary() {
        List<Order> allOrders = orderRepository.findAll();
        long totalOrders = allOrders.size();

        BigDecimal totalSales = allOrders.stream()
                .filter(o -> o.getPaymentStatus() == PaymentStatus.SUCCESS || o.getStatus() == OrderStatus.DELIVERED)
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING || o.getStatus() == OrderStatus.CONFIRMED)
                .count();

        long totalCustomers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .count();

        List<Product> products = productRepository.findAll();
        long totalProducts = products.size();
        long lowStockProducts = products.stream()
                .filter(p -> p.getStock() < 15)
                .count();

        return new DashboardSummaryResponse(
                totalOrders,
                totalSales,
                pendingOrders,
                totalCustomers,
                totalProducts,
                lowStockProducts
        );
    }

    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserProfileResponse::fromUser)
                .collect(Collectors.toList());
    }

    public UserProfileResponse setUserStatus(String userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setActive(active);
        userRepository.save(user);
        return UserProfileResponse.fromUser(user);
    }
}
