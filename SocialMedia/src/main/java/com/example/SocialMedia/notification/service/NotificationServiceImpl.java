package com.example.SocialMedia.notification.service;

import com.example.SocialMedia.notification.model.NotificationChannel;
import com.example.SocialMedia.notification.model.NotificationEvent;
import com.example.SocialMedia.notification.model.NotificationLog;
import com.example.SocialMedia.notification.model.NotificationStatus;
import com.example.SocialMedia.notification.repository.NotificationRepository;
import com.example.SocialMedia.order.model.Order;
import com.example.SocialMedia.payment.model.PaymentRecord;
import com.example.SocialMedia.user.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final SmsGatewayClient smsGatewayClient;
    private final EmailGatewayClient emailGatewayClient;
    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(SmsGatewayClient smsGatewayClient,
                                   EmailGatewayClient emailGatewayClient,
                                   NotificationRepository notificationRepository) {
        this.smsGatewayClient = smsGatewayClient;
        this.emailGatewayClient = emailGatewayClient;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void notifyOrderPlaced(Order order, User user) {
        String customerName = user != null ? user.getName() : "Valued Customer";
        String phone = resolvePhone(order, user);
        String email = user != null ? user.getEmail() : null;

        // 1. Send SMS
        if (phone != null && !phone.isBlank()) {
            String smsText = String.format(
                    "Dear %s, your order #%s of BDT %s has been placed successfully. Payment Method: %s. Delivery to %s. Thank you for shopping with Deshi Commerce!",
                    customerName,
                    order.getOrderNumber(),
                    order.getTotal(),
                    order.getPaymentMethod(),
                    order.getShippingAddress() != null ? order.getShippingAddress().getDistrict() : "Bangladesh"
            );

            boolean sent = smsGatewayClient.sendSms(phone, smsText);
            saveLog(NotificationChannel.SMS, NotificationEvent.ORDER_PLACED, phone,
                    "Order Confirmation: #" + order.getOrderNumber(), smsText,
                    sent ? NotificationStatus.SENT : NotificationStatus.FAILED,
                    order.getId(), user != null ? user.getId() : null);
        }

        // 2. Send Email
        if (email != null && !email.isBlank()) {
            String subject = "Order Confirmation - #" + order.getOrderNumber() + " | Deshi Commerce";
            String emailHtml = String.format(
                    "<h2>Thank you for your order, %s!</h2>" +
                    "<p>Your order <strong>#%s</strong> has been placed and is currently being processed.</p>" +
                    "<p><strong>Subtotal:</strong> BDT %s<br/>" +
                    "<strong>Delivery Charge:</strong> BDT %s<br/>" +
                    "<strong>Total:</strong> BDT %s<br/>" +
                    "<strong>Payment Method:</strong> %s</p>" +
                    "<p>We will notify you as soon as your items are dispatched with courier tracking.</p>",
                    customerName, order.getOrderNumber(), order.getSubtotal(),
                    order.getDeliveryCharge(), order.getTotal(), order.getPaymentMethod()
            );

            boolean sent = emailGatewayClient.sendEmail(email, subject, emailHtml);
            saveLog(NotificationChannel.EMAIL, NotificationEvent.ORDER_PLACED, email,
                    subject, emailHtml,
                    sent ? NotificationStatus.SENT : NotificationStatus.FAILED,
                    order.getId(), user != null ? user.getId() : null);
        }
    }

    @Override
    public void notifyPaymentReceived(Order order, PaymentRecord payment, User user) {
        String customerName = user != null ? user.getName() : "Valued Customer";
        String phone = resolvePhone(order, user);
        String email = user != null ? user.getEmail() : null;

        if (phone != null && !phone.isBlank()) {
            String smsText = String.format(
                    "Dear %s, payment of BDT %s for order #%s received successfully via %s. Transaction ID: %s. Deshi Commerce.",
                    customerName, payment.getAmount(), order.getOrderNumber(),
                    payment.getMethod(), payment.getTransactionId()
            );

            boolean sent = smsGatewayClient.sendSms(phone, smsText);
            saveLog(NotificationChannel.SMS, NotificationEvent.PAYMENT_RECEIVED, phone,
                    "Payment Receipt: #" + order.getOrderNumber(), smsText,
                    sent ? NotificationStatus.SENT : NotificationStatus.FAILED,
                    order.getId(), user != null ? user.getId() : null);
        }

        if (email != null && !email.isBlank()) {
            String subject = "Payment Confirmation - Order #" + order.getOrderNumber();
            String emailHtml = String.format(
                    "<h2>Payment Confirmed!</h2>" +
                    "<p>We have successfully received your payment of <strong>BDT %s</strong> for order <strong>#%s</strong> via %s.</p>" +
                    "<p><strong>Transaction ID:</strong> %s</p>",
                    payment.getAmount(), order.getOrderNumber(), payment.getMethod(), payment.getTransactionId()
            );

            boolean sent = emailGatewayClient.sendEmail(email, subject, emailHtml);
            saveLog(NotificationChannel.EMAIL, NotificationEvent.PAYMENT_RECEIVED, email,
                    subject, emailHtml,
                    sent ? NotificationStatus.SENT : NotificationStatus.FAILED,
                    order.getId(), user != null ? user.getId() : null);
        }
    }

    @Override
    public void notifyOrderShipped(Order order, User user) {
        String customerName = user != null ? user.getName() : "Valued Customer";
        String phone = resolvePhone(order, user);
        String email = user != null ? user.getEmail() : null;

        String courier = order.getCourierName() != null ? order.getCourierName() : "our delivery partner";
        String tracking = order.getTrackingNumber() != null ? order.getTrackingNumber() : "N/A";
        String trackingUrl = order.getTrackingUrl() != null ? order.getTrackingUrl() : "";

        if (phone != null && !phone.isBlank()) {
            String smsText = String.format(
                    "Dear %s, your order #%s has been SHIPPED via %s. Tracking No: %s. Track your parcel: %s. Deshi Commerce.",
                    customerName, order.getOrderNumber(), courier, tracking, trackingUrl
            );

            boolean sent = smsGatewayClient.sendSms(phone, smsText);
            saveLog(NotificationChannel.SMS, NotificationEvent.ORDER_SHIPPED, phone,
                    "Order Shipped: #" + order.getOrderNumber(), smsText,
                    sent ? NotificationStatus.SENT : NotificationStatus.FAILED,
                    order.getId(), user != null ? user.getId() : null);
        }

        if (email != null && !email.isBlank()) {
            String subject = "Your Order #" + order.getOrderNumber() + " Has Been Shipped!";
            String emailHtml = String.format(
                    "<h2>Your package is on its way!</h2>" +
                    "<p>Order <strong>#%s</strong> has been handed over to <strong>%s</strong>.</p>" +
                    "<p><strong>Tracking Number:</strong> %s<br/>" +
                    "<strong>Track Online:</strong> <a href=\"%s\">%s</a></p>",
                    order.getOrderNumber(), courier, tracking, trackingUrl, trackingUrl
            );

            boolean sent = emailGatewayClient.sendEmail(email, subject, emailHtml);
            saveLog(NotificationChannel.EMAIL, NotificationEvent.ORDER_SHIPPED, email,
                    subject, emailHtml,
                    sent ? NotificationStatus.SENT : NotificationStatus.FAILED,
                    order.getId(), user != null ? user.getId() : null);
        }
    }

    @Override
    public void notifyOrderDelivered(Order order, User user) {
        String customerName = user != null ? user.getName() : "Valued Customer";
        String phone = resolvePhone(order, user);

        if (phone != null && !phone.isBlank()) {
            String smsText = String.format(
                    "Dear %s, your order #%s has been successfully DELIVERED. We hope you love your products! Deshi Commerce.",
                    customerName, order.getOrderNumber()
            );

            boolean sent = smsGatewayClient.sendSms(phone, smsText);
            saveLog(NotificationChannel.SMS, NotificationEvent.ORDER_DELIVERED, phone,
                    "Order Delivered: #" + order.getOrderNumber(), smsText,
                    sent ? NotificationStatus.SENT : NotificationStatus.FAILED,
                    order.getId(), user != null ? user.getId() : null);
        }
    }

    @Override
    public void notifyOrderCancelled(Order order, User user) {
        String customerName = user != null ? user.getName() : "Valued Customer";
        String phone = resolvePhone(order, user);

        if (phone != null && !phone.isBlank()) {
            String smsText = String.format(
                    "Dear %s, your order #%s has been CANCELLED. If you made an online payment, a refund has been initiated. Deshi Commerce.",
                    customerName, order.getOrderNumber()
            );

            boolean sent = smsGatewayClient.sendSms(phone, smsText);
            saveLog(NotificationChannel.SMS, NotificationEvent.ORDER_CANCELLED, phone,
                    "Order Cancelled: #" + order.getOrderNumber(), smsText,
                    sent ? NotificationStatus.SENT : NotificationStatus.FAILED,
                    order.getId(), user != null ? user.getId() : null);
        }
    }

    @Override
    public List<NotificationLog> getOrderNotifications(String orderId) {
        return notificationRepository.findByOrderId(orderId);
    }

    @Override
    public List<NotificationLog> getAllNotifications() {
        return notificationRepository.findAll();
    }

    private void saveLog(NotificationChannel channel, NotificationEvent event, String recipient,
                         String subject, String message, NotificationStatus status,
                         String orderId, String userId) {
        try {
            NotificationLog logEntry = new NotificationLog(
                    "notif_" + UUID.randomUUID().toString().substring(0, 8),
                    channel, event, recipient, subject, message, status, orderId, userId
            );
            notificationRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to save notification audit log: {}", e.getMessage());
        }
    }

    private String resolvePhone(Order order, User user) {
        if (order.getShippingAddress() != null && order.getShippingAddress().getPhone() != null && !order.getShippingAddress().getPhone().isBlank()) {
            return order.getShippingAddress().getPhone();
        }
        if (user != null && user.getPhone() != null && !user.getPhone().isBlank()) {
            return user.getPhone();
        }
        return null;
    }
}
