package com.example.SocialMedia;

import com.example.SocialMedia.address.dto.AddressRequest;
import com.example.SocialMedia.address.dto.AddressResponse;
import com.example.SocialMedia.address.service.AddressService;
import com.example.SocialMedia.admin.dto.CustomerOrderTrackingSummary;
import com.example.SocialMedia.auth.dto.RegisterRequest;
import com.example.SocialMedia.auth.dto.TokenResponse;
import com.example.SocialMedia.auth.service.AuthService;
import com.example.SocialMedia.cart.dto.AddToCartRequest;
import com.example.SocialMedia.cart.service.CartService;
import com.example.SocialMedia.common.service.DeliveryService;
import com.example.SocialMedia.order.dto.CreateOrderRequest;
import com.example.SocialMedia.order.dto.OrderResponse;
import com.example.SocialMedia.order.dto.OrderTrackingUpdateRequest;
import com.example.SocialMedia.order.model.OrderStatus;
import com.example.SocialMedia.order.service.OrderService;
import com.example.SocialMedia.payment.dto.SslCommerzCallbackResponse;
import com.example.SocialMedia.payment.dto.SslCommerzInitResponse;
import com.example.SocialMedia.payment.model.PaymentMethod;
import com.example.SocialMedia.payment.model.PaymentStatus;
import com.example.SocialMedia.payment.service.SslCommerzService;
import com.example.SocialMedia.product.model.Product;
import com.example.SocialMedia.product.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class OrderAndPaymentWorkflowTest {

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private AuthService authService;

    @Autowired
    private AddressService addressService;

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private SslCommerzService sslCommerzService;

    @Autowired
    private ProductRepository productRepository;

    @Test
    @DisplayName("DeliveryService calculates 60 BDT inside Dhaka, 120 BDT outside Dhaka, and 0 BDT over 5000")
    void testDeliveryCalculation() {
        // Inside Dhaka under 5000
        BigDecimal insideDhaka = deliveryService.calculateDeliveryCharge(BigDecimal.valueOf(1000), "Dhaka", "Dhaka");
        assertEquals(BigDecimal.valueOf(60), insideDhaka);

        // Outside Dhaka (Chittagong) under 5000
        BigDecimal outsideDhaka = deliveryService.calculateDeliveryCharge(BigDecimal.valueOf(1000), "Chittagong", "Chittagong");
        assertEquals(BigDecimal.valueOf(120), outsideDhaka);

        // Outside Dhaka (Sylhet) under 5000
        BigDecimal sylhet = deliveryService.calculateDeliveryCharge(BigDecimal.valueOf(1500), "Sylhet", "Sylhet");
        assertEquals(BigDecimal.valueOf(120), sylhet);

        // Free delivery over 5000
        BigDecimal freeDelivery = deliveryService.calculateDeliveryCharge(BigDecimal.valueOf(6000), "Chittagong", "Chittagong");
        assertEquals(BigDecimal.ZERO, freeDelivery);
    }

    @Test
    @DisplayName("Full checkout and SSLCommerz payment simulation flow")
    void testCheckoutAndSslCommerzWorkflow() {
        String email = "ssluser_" + System.currentTimeMillis() + "@test.com";
        String phone = "018" + String.format("%08d", (System.currentTimeMillis() % 100000000));
        TokenResponse tokens = authService.register(new RegisterRequest("Shopper", phone, email, "Password123!"));
        String authHeader = "Bearer " + tokens.getAccessToken();

        // 1. Create affordable test product (1500 BDT) so delivery charge is applicable
        Product shirt = new Product(
                "prd_test_shirt_" + System.currentTimeMillis(),
                "Premium Cotton Shirt",
                "premium-cotton-shirt-" + System.currentTimeMillis(),
                "Comfortable summer shirt",
                BigDecimal.valueOf(1500),
                null,
                "BDT",
                50,
                "cat_03",
                new ArrayList<>(),
                true,
                4.8,
                Instant.now()
        );
        productRepository.save(shirt);

        // 2. Add to Cart
        cartService.addItem(authHeader, new AddToCartRequest(shirt.getId(), 1));

        // 3. Save Outside Dhaka Address (Chittagong)
        AddressRequest addrReq = new AddressRequest();
        addrReq.setName("Shopper");
        addrReq.setPhone("01822334455");
        addrReq.setDivision("Chittagong");
        addrReq.setDistrict("Chittagong");
        addrReq.setUpazila("Panchlaish");
        addrReq.setAddressLine("GEC Circle, Road 2");
        addrReq.setIsDefault(true);

        AddressResponse address = addressService.createAddress(authHeader, addrReq);
        assertNotNull(address.getId());

        // 4. Place Order with SSLCOMMERZ
        CreateOrderRequest orderReq = new CreateOrderRequest(address.getId(), PaymentMethod.SSLCOMMERZ, "Test Order");
        OrderResponse order = orderService.createOrder(authHeader, orderReq);

        assertNotNull(order.getId());
        assertEquals(0, BigDecimal.valueOf(1500).compareTo(order.getSubtotal()));
        assertEquals(0, BigDecimal.valueOf(120).compareTo(order.getDeliveryCharge()), "Outside Dhaka delivery charge must be 120 BDT");
        assertEquals(0, BigDecimal.valueOf(1620).compareTo(order.getTotal()));
        assertEquals(OrderStatus.PENDING, order.getStatus());

        // 5. Initiate SSLCommerz Session
        SslCommerzInitResponse initRes = sslCommerzService.initiatePayment(order.getId());
        assertEquals("SUCCESS", initRes.getStatus());
        assertNotNull(initRes.getGatewayPageURL());
        assertTrue(initRes.getGatewayPageURL().contains("sslcommerz.com"));

        // 6. Simulate Successful Gateway Payment Callback
        SslCommerzCallbackResponse callbackRes = sslCommerzService.simulateSuccess(order.getId());
        assertTrue(callbackRes.isSuccess());

        // 7. Verify Order Status transitioned to CONFIRMED and payment is SUCCESS
        OrderResponse updatedOrder = orderService.getOrderById(authHeader, order.getId());
        assertEquals(OrderStatus.CONFIRMED, updatedOrder.getStatus(), "Order must be CONFIRMED after payment");
        assertEquals(PaymentStatus.SUCCESS, updatedOrder.getPaymentStatus(), "Payment must be SUCCESS");

        // 8. Admin Assigns Courier Tracking (Steadfast)
        OrderTrackingUpdateRequest trackingReq = new OrderTrackingUpdateRequest(
                "Steadfast",
                "ST-987654",
                null,
                "2026-10-02",
                OrderStatus.SHIPPED,
                "Dispatched from Dhaka Hub"
        );
        OrderResponse trackedOrder = orderService.updateOrderTrackingAdmin(order.getId(), trackingReq);
        assertEquals(OrderStatus.SHIPPED, trackedOrder.getStatus());
        assertEquals("Steadfast", trackedOrder.getCourierName());
        assertEquals("ST-987654", trackedOrder.getTrackingNumber());
        assertTrue(trackedOrder.getTrackingUrl().contains("steadfast.com.bd"));

        // 9. Admin Tracks Customer Orders Summary
        CustomerOrderTrackingSummary summary = orderService.getCustomerOrderSummaryAdmin(updatedOrder.getUserId());
        assertNotNull(summary);
        assertEquals(1, summary.getTotalOrdersCount());
        assertEquals(0, BigDecimal.valueOf(1620).compareTo(summary.getTotalAmountSpent()));
    }
}
