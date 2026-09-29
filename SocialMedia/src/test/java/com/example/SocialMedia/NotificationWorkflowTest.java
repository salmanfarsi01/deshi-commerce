package com.example.SocialMedia;

import com.example.SocialMedia.address.dto.AddressRequest;
import com.example.SocialMedia.address.dto.AddressResponse;
import com.example.SocialMedia.address.service.AddressService;
import com.example.SocialMedia.auth.dto.RegisterRequest;
import com.example.SocialMedia.auth.dto.TokenResponse;
import com.example.SocialMedia.auth.service.AuthService;
import com.example.SocialMedia.cart.dto.AddToCartRequest;
import com.example.SocialMedia.cart.service.CartService;
import com.example.SocialMedia.notification.model.NotificationChannel;
import com.example.SocialMedia.notification.model.NotificationEvent;
import com.example.SocialMedia.notification.model.NotificationLog;
import com.example.SocialMedia.notification.service.NotificationService;
import com.example.SocialMedia.order.dto.CreateOrderRequest;
import com.example.SocialMedia.order.dto.OrderResponse;
import com.example.SocialMedia.order.dto.OrderTrackingUpdateRequest;
import com.example.SocialMedia.order.service.OrderService;
import com.example.SocialMedia.payment.model.PaymentMethod;
import com.example.SocialMedia.payment.service.SslCommerzService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
public class NotificationWorkflowTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private CartService cartService;

    @Autowired
    private AddressService addressService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private SslCommerzService sslCommerzService;

    @Autowired
    private NotificationService notificationService;

    @Test
    @DisplayName("Verify SMS and Email notifications upon Order Placement, Payment, and Courier Shipment")
    void testOrderLifecycleNotifications() {
        // 1. Register test customer
        String uniquePhone = "019" + String.format("%08d", (System.currentTimeMillis() % 100000000));
        String uniqueEmail = "notif_" + System.currentTimeMillis() + "@test.com";
        TokenResponse tokens = authService.register(new RegisterRequest("Tanvir Customer", uniquePhone, uniqueEmail, "Password123!"));
        String authHeader = "Bearer " + tokens.getAccessToken();

        // 2. Add item to cart
        cartService.addItem(authHeader, new AddToCartRequest("prd_01", 1));

        // 3. Create address
        AddressRequest addrReq = new AddressRequest();
        addrReq.setName("Tanvir Customer");
        addrReq.setPhone(uniquePhone);
        addrReq.setDivision("Dhaka");
        addrReq.setDistrict("Dhaka");
        addrReq.setUpazila("Mirpur");
        addrReq.setAddressLine("Block D, Road 3");
        addrReq.setIsDefault(true);
        AddressResponse address = addressService.createAddress(authHeader, addrReq);

        // 4. Place Order
        CreateOrderRequest orderReq = new CreateOrderRequest(address.getId(), PaymentMethod.SSLCOMMERZ, "Leave at reception");
        OrderResponse order = orderService.createOrder(authHeader, orderReq);
        assertNotNull(order.getId());

        // 5. Verify Order Placed Notifications (both SMS & Email logged)
        List<NotificationLog> placedLogs = notificationService.getOrderNotifications(order.getId());
        assertFalse(placedLogs.isEmpty(), "Notification logs must be created for order");

        boolean hasOrderPlacedSms = placedLogs.stream()
                .anyMatch(l -> l.getChannel() == NotificationChannel.SMS && l.getEvent() == NotificationEvent.ORDER_PLACED);
        assertTrue(hasOrderPlacedSms, "Customer should receive SMS on order placement");

        boolean hasOrderPlacedEmail = placedLogs.stream()
                .anyMatch(l -> l.getChannel() == NotificationChannel.EMAIL && l.getEvent() == NotificationEvent.ORDER_PLACED);
        assertTrue(hasOrderPlacedEmail, "Customer should receive Email on order placement");

        // 6. Simulate SSLCommerz Payment Confirmation
        sslCommerzService.simulateSuccess(order.getId());

        List<NotificationLog> paymentLogs = notificationService.getOrderNotifications(order.getId());
        boolean hasPaymentSms = paymentLogs.stream()
                .anyMatch(l -> l.getChannel() == NotificationChannel.SMS && l.getEvent() == NotificationEvent.PAYMENT_RECEIVED);
        assertTrue(hasPaymentSms, "Customer should receive SMS when payment is confirmed");

        // 7. Admin updates tracking (Steadfast Courier)
        OrderTrackingUpdateRequest trackingReq = new OrderTrackingUpdateRequest(
                "Steadfast",
                "ST-554433",
                null,
                "2026-10-02",
                null,
                "Dispatched"
        );
        orderService.updateOrderTrackingAdmin(order.getId(), trackingReq);

        List<NotificationLog> shippedLogs = notificationService.getOrderNotifications(order.getId());
        NotificationLog shippedSms = shippedLogs.stream()
                .filter(l -> l.getChannel() == NotificationChannel.SMS && l.getEvent() == NotificationEvent.ORDER_SHIPPED)
                .findFirst()
                .orElse(null);

        assertNotNull(shippedSms, "Customer should receive SMS on order shipment");
        assertTrue(shippedSms.getMessage().contains("Steadfast"), "SMS should mention courier name");
        assertTrue(shippedSms.getMessage().contains("ST-554433"), "SMS should mention tracking number");
    }
}
