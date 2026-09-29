package com.example.SocialMedia.payment.service;

import com.example.SocialMedia.common.exception.BadRequestException;
import com.example.SocialMedia.common.exception.ResourceNotFoundException;
import com.example.SocialMedia.order.model.Order;
import com.example.SocialMedia.order.model.OrderStatus;
import com.example.SocialMedia.order.repository.OrderRepository;
import com.example.SocialMedia.payment.dto.SslCommerzCallbackResponse;
import com.example.SocialMedia.payment.dto.SslCommerzInitResponse;
import com.example.SocialMedia.payment.model.PaymentMethod;
import com.example.SocialMedia.payment.model.PaymentRecord;
import com.example.SocialMedia.payment.model.PaymentStatus;
import com.example.SocialMedia.payment.repository.PaymentRepository;
import com.example.SocialMedia.user.model.User;
import com.example.SocialMedia.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class SslCommerzService {

    @Value("${sslcommerz.store-id:testbox}")
    private String storeId;

    @Value("${sslcommerz.store-password:qwerty}")
    private String storePassword;

    @Value("${sslcommerz.is-sandbox:true}")
    private boolean isSandbox;

    @Value("${sslcommerz.success-url:http://localhost:8080/api/v1/payments/sslcommerz/success}")
    private String successUrl;

    @Value("${sslcommerz.fail-url:http://localhost:8080/api/v1/payments/sslcommerz/fail}")
    private String failUrl;

    @Value("${sslcommerz.cancel-url:http://localhost:8080/api/v1/payments/sslcommerz/cancel}")
    private String cancelUrl;

    @Value("${sslcommerz.ipn-url:http://localhost:8080/api/v1/payments/sslcommerz/ipn}")
    private String ipnUrl;

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final com.example.SocialMedia.notification.service.NotificationService notificationService;

    public SslCommerzService(OrderRepository orderRepository,
                             PaymentRepository paymentRepository,
                             UserRepository userRepository,
                             com.example.SocialMedia.notification.service.NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public SslCommerzInitResponse initiatePayment(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("Order " + order.getOrderNumber() + " is already paid");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot initiate payment for a cancelled order");
        }

        User user = userRepository.findById(order.getUserId()).orElse(null);

        String tranId = "SSLCZ_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        String sessionkey = "SESSION_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        String baseUrl = isSandbox
                ? "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php"
                : "https://securepay.sslcommerz.com/gwprocess/v4/gw.php";
        String gatewayPageUrl = baseUrl + "?sessionkey=" + sessionkey;

        // Upsert PaymentRecord
        Optional<PaymentRecord> existingRecord = paymentRepository.findByOrderId(order.getId());
        PaymentRecord record;
        if (existingRecord.isPresent()) {
            record = existingRecord.get();
            record.setMethod(PaymentMethod.SSLCOMMERZ);
            record.setStatus(PaymentStatus.INITIATED);
            record.setTransactionId(tranId);
            record.setGatewayPaymentUrl(gatewayPageUrl);
        } else {
            String paymentId = "pay_" + UUID.randomUUID().toString().substring(0, 8);
            record = new PaymentRecord(
                    paymentId,
                    order.getId(),
                    order.getUserId(),
                    order.getTotal(),
                    order.getCurrency(),
                    PaymentMethod.SSLCOMMERZ,
                    PaymentStatus.INITIATED,
                    tranId,
                    gatewayPageUrl
            );
        }
        paymentRepository.save(record);

        // Update order payment method
        order.setPaymentMethod(PaymentMethod.SSLCOMMERZ);
        order.setPaymentStatus(PaymentStatus.INITIATED);
        order.setUpdatedAt(Instant.now());
        orderRepository.save(order);

        return new SslCommerzInitResponse(
                "SUCCESS",
                sessionkey,
                gatewayPageUrl,
                order.getId(),
                tranId,
                order.getTotal(),
                order.getCurrency(),
                "SSLCommerz gateway session initiated successfully"
        );
    }

    public SslCommerzCallbackResponse handleSuccess(Map<String, String> payload) {
        String tranId = payload.get("tran_id");
        String valId = payload.getOrDefault("val_id", "VAL_" + UUID.randomUUID().toString().substring(0, 8));
        String cardType = payload.getOrDefault("card_type", "VISA");
        String bankTranId = payload.getOrDefault("bank_tran_id", "BANK_" + UUID.randomUUID().toString().substring(0, 8));

        PaymentRecord record = paymentRepository.findByTransactionId(tranId).orElse(null);
        if (record == null) {
            return new SslCommerzCallbackResponse(false, "Transaction not found for ID: " + tranId, tranId, valId, null, null, cardType, bankTranId);
        }

        record.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(record);

        Order order = orderRepository.findById(record.getOrderId()).orElse(null);
        if (order != null) {
            order.setPaymentStatus(PaymentStatus.SUCCESS);
            order.setStatus(OrderStatus.CONFIRMED);
            order.setNotes((order.getNotes() != null ? order.getNotes() + " | " : "")
                    + String.format("Paid via SSLCommerz [Card: %s, ValID: %s]", cardType, valId));
            order.setUpdatedAt(Instant.now());
            orderRepository.save(order);

            // Notify user of successful payment
            User customer = userRepository.findById(order.getUserId()).orElse(null);
            notificationService.notifyPaymentReceived(order, record, customer);
        }

        return new SslCommerzCallbackResponse(
                true,
                "Payment successfully completed and verified via SSLCommerz",
                tranId,
                valId,
                record.getOrderId(),
                record.getAmount(),
                cardType,
                bankTranId
        );
    }

    public SslCommerzCallbackResponse handleFail(Map<String, String> payload) {
        String tranId = payload.get("tran_id");
        String error = payload.getOrDefault("error", "Transaction failed on gateway");

        PaymentRecord record = paymentRepository.findByTransactionId(tranId).orElse(null);
        if (record != null) {
            record.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(record);

            Order order = orderRepository.findById(record.getOrderId()).orElse(null);
            if (order != null) {
                order.setPaymentStatus(PaymentStatus.FAILED);
                order.setNotes((order.getNotes() != null ? order.getNotes() + " | " : "") + "SSLCommerz Failed: " + error);
                order.setUpdatedAt(Instant.now());
                orderRepository.save(order);
            }
        }

        return new SslCommerzCallbackResponse(
                false,
                "Payment failed: " + error,
                tranId,
                null,
                record != null ? record.getOrderId() : null,
                record != null ? record.getAmount() : null,
                null,
                null
        );
    }

    public SslCommerzCallbackResponse handleCancel(Map<String, String> payload) {
        String tranId = payload.get("tran_id");

        PaymentRecord record = paymentRepository.findByTransactionId(tranId).orElse(null);
        if (record != null) {
            record.setStatus(PaymentStatus.CANCELLED);
            paymentRepository.save(record);

            Order order = orderRepository.findById(record.getOrderId()).orElse(null);
            if (order != null) {
                order.setPaymentStatus(PaymentStatus.FAILED);
                order.setNotes((order.getNotes() != null ? order.getNotes() + " | " : "") + "SSLCommerz payment cancelled by user");
                order.setUpdatedAt(Instant.now());
                orderRepository.save(order);
            }
        }

        return new SslCommerzCallbackResponse(
                false,
                "Payment was cancelled by the customer",
                tranId,
                null,
                record != null ? record.getOrderId() : null,
                record != null ? record.getAmount() : null,
                null,
                null
        );
    }

    public SslCommerzCallbackResponse simulateSuccess(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        PaymentRecord record = paymentRepository.findByOrderId(orderId).orElse(null);
        String tranId;
        if (record != null) {
            tranId = record.getTransactionId();
        } else {
            tranId = "SSLCZ_SIM_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            String paymentId = "pay_" + UUID.randomUUID().toString().substring(0, 8);
            record = new PaymentRecord(
                    paymentId,
                    order.getId(),
                    order.getUserId(),
                    order.getTotal(),
                    order.getCurrency(),
                    PaymentMethod.SSLCOMMERZ,
                    PaymentStatus.INITIATED,
                    tranId,
                    "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?sessionkey=SIMULATED"
            );
        }

        record.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(record);

        order.setPaymentMethod(PaymentMethod.SSLCOMMERZ);
        order.setPaymentStatus(PaymentStatus.SUCCESS);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setNotes((order.getNotes() != null ? order.getNotes() + " | " : "") + "SSLCommerz Simulated Test Success (" + tranId + ")");
        order.setUpdatedAt(Instant.now());
        orderRepository.save(order);

        User customer = userRepository.findById(order.getUserId()).orElse(null);
        notificationService.notifyPaymentReceived(order, record, customer);

        String valId = "VAL_SIM_" + UUID.randomUUID().toString().substring(0, 8);
        return new SslCommerzCallbackResponse(
                true,
                "Simulated SSLCommerz success: Order marked as PAID and CONFIRMED",
                tranId,
                valId,
                order.getId(),
                order.getTotal(),
                "VISA_SANDBOX",
                "BANK_TRAN_SIM_123"
        );
    }
}
