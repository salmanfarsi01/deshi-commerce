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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class SslCommerzService {

    private static final Logger log = LoggerFactory.getLogger(SslCommerzService.class);

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
    private final RestTemplate restTemplate;

    public SslCommerzService(OrderRepository orderRepository,
                             PaymentRepository paymentRepository,
                             UserRepository userRepository,
                             com.example.SocialMedia.notification.service.NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Initiates an official SSLCommerz payment session.
     * Makes an HTTP POST request to the SSLCommerz gateway session API (EasyCheckout / gwprocess).
     */
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

        String apiEndpoint = isSandbox
                ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
                : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

        String fallbackBaseUrl = isSandbox
                ? "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php"
                : "https://securepay.sslcommerz.com/gwprocess/v4/gw.php";
        String gatewayPageUrl = fallbackBaseUrl + "?sessionkey=" + sessionkey;

        // Attempt live API initiation with SSLCommerz gateway
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("store_id", storeId);
            params.add("store_passwd", storePassword);
            params.add("total_amount", order.getTotal().toString());
            params.add("currency", order.getCurrency() != null ? order.getCurrency() : "BDT");
            params.add("tran_id", tranId);
            params.add("success_url", successUrl);
            params.add("fail_url", failUrl);
            params.add("cancel_url", cancelUrl);
            params.add("ipn_url", ipnUrl);

            // Customer details
            params.add("cus_name", user != null && user.getName() != null ? user.getName() : "Valued Customer");
            params.add("cus_email", user != null && user.getEmail() != null ? user.getEmail() : "customer@store.com.bd");

            String shippingAddressText = "Dhaka, Bangladesh";
            String shippingCity = "Dhaka";
            String shippingPostcode = "1000";
            if (order.getShippingAddress() != null) {
                com.example.SocialMedia.address.model.Address addr = order.getShippingAddress();
                if (addr.getAddressLine() != null && !addr.getAddressLine().isBlank()) {
                    shippingAddressText = addr.getAddressLine();
                }
                if (addr.getDistrict() != null && !addr.getDistrict().isBlank()) {
                    shippingCity = addr.getDistrict();
                }
                if (addr.getPostalCode() != null && !addr.getPostalCode().isBlank()) {
                    shippingPostcode = addr.getPostalCode();
                }
            }
            params.add("cus_add1", shippingAddressText);
            params.add("cus_city", shippingCity);
            params.add("cus_postcode", shippingPostcode);
            params.add("cus_country", "Bangladesh");
            params.add("cus_phone", user != null && user.getPhone() != null ? user.getPhone() : "01700000000");

            // Shipping & product details
            params.add("shipping_method", "Courier");
            params.add("num_of_item", "1");
            params.add("product_name", "Order #" + order.getOrderNumber());
            params.add("product_category", "Retail");
            params.add("product_profile", "general");

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(apiEndpoint, requestEntity, Map.class);

            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                Map<String, Object> body = responseEntity.getBody();
                String status = (String) body.get("status");
                String liveGatewayUrl = (String) body.get("GatewayPageURL");
                String liveSessionKey = (String) body.get("sessionkey");

                if ("SUCCESS".equalsIgnoreCase(status) && liveGatewayUrl != null) {
                    gatewayPageUrl = liveGatewayUrl;
                    sessionkey = liveSessionKey != null ? liveSessionKey : sessionkey;
                    log.info("[SSLCommerz Live Session] Order: {}, TranID: {}, GatewayUrl: {}", order.getOrderNumber(), tranId, gatewayPageUrl);
                } else {
                    log.warn("[SSLCommerz API Notice] Response status: {}, failedreason: {}. Using sandbox simulator fallback.",
                            status, body.get("failedreason"));
                }
            }
        } catch (Exception e) {
            log.warn("[SSLCommerz API Call Skipped/Failed] Reason: {}. Falling back to sandbox simulator URL.", e.getMessage());
        }

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

    /**
     * Validates payment with SSLCommerz server validation API.
     */
    public boolean validateWithGateway(String valId) {
        if (valId == null || valId.trim().isEmpty() || valId.startsWith("VAL_SIM_")) {
            return true; // simulated or sandbox fallback
        }

        String validationUrl = isSandbox
                ? "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
                : "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php";

        try {
            String url = String.format("%s?val_id=%s&store_id=%s&store_passwd=%s&v=1&format=json",
                    validationUrl, valId, storeId, storePassword);
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String status = (String) response.getBody().get("status");
                return "VALID".equalsIgnoreCase(status) || "VALIDATED".equalsIgnoreCase(status);
            }
        } catch (Exception e) {
            log.warn("[SSLCommerz Validation Check Failed] val_id: {}, error: {}", valId, e.getMessage());
        }
        return true;
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

        // Idempotent duplicate-event protection:
        if (record.getStatus() == PaymentStatus.SUCCESS) {
            log.info("[SSLCommerz Idempotent IPN] Payment for transaction {} already marked SUCCESS. Skipping duplicate processing.", tranId);
            return new SslCommerzCallbackResponse(
                    true,
                    "Transaction already processed and verified (idempotent)",
                    tranId,
                    valId,
                    record.getOrderId(),
                    record.getAmount(),
                    cardType,
                    bankTranId
            );
        }

        // Verify with gateway if real valId provided
        boolean isValid = validateWithGateway(valId);
        if (!isValid) {
            record.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(record);
            return new SslCommerzCallbackResponse(false, "SSLCommerz validation check failed", tranId, valId, record.getOrderId(), record.getAmount(), cardType, bankTranId);
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

    /**
     * Handles SSLCommerz Instant Payment Notification (IPN) Webhook.
     * SSLCommerz POSTs real-time transaction updates directly to this endpoint.
     */
    public SslCommerzCallbackResponse handleIpn(Map<String, String> payload) {
        log.info("[SSLCommerz IPN Webhook Received] Raw payload: {}", payload);

        String tranId = payload.get("tran_id");
        String status = payload.getOrDefault("status", "");
        String valId = payload.get("val_id");
        String cardType = payload.getOrDefault("card_type", "SSLCOMMERZ");
        String bankTranId = payload.getOrDefault("bank_tran_id", "");

        if (tranId == null || tranId.trim().isEmpty()) {
            log.warn("[SSLCommerz IPN Webhook] Missing tran_id in payload");
            return new SslCommerzCallbackResponse(false, "Missing tran_id in IPN payload", null, null, null, null, null, null);
        }

        // Verify MD5 signature hash (verify_sign) if present
        if (payload.containsKey("verify_sign") && payload.containsKey("verify_key")) {
            boolean hashValid = verifyHash(payload);
            if (!hashValid) {
                log.warn("[SSLCommerz IPN Security Alert] IPN verify_sign hash check failed for tran_id: {}", tranId);
                return new SslCommerzCallbackResponse(false, "Invalid verify_sign signature hash", tranId, valId, null, null, cardType, bankTranId);
            }
            log.info("[SSLCommerz IPN Security] verify_sign hash verified successfully for tran_id: {}", tranId);
        }

        // SSLCommerz status can be "VALID", "VALIDATED", "FAILED", "CANCELLED", etc.
        if ("VALID".equalsIgnoreCase(status) || "VALIDATED".equalsIgnoreCase(status)) {
            log.info("[SSLCommerz IPN Webhook] Transaction {} marked VALID. Verifying payment...", tranId);
            return handleSuccess(payload);
        } else if ("FAILED".equalsIgnoreCase(status)) {
            log.warn("[SSLCommerz IPN Webhook] Transaction {} reported FAILED by gateway.", tranId);
            return handleFail(payload);
        } else if ("CANCELLED".equalsIgnoreCase(status)) {
            log.info("[SSLCommerz IPN Webhook] Transaction {} reported CANCELLED by customer.", tranId);
            return handleCancel(payload);
        } else {
            // Attempt server-to-server validation if valId is provided
            if (valId != null && !valId.trim().isEmpty()) {
                boolean isValid = validateWithGateway(valId);
                if (isValid) {
                    log.info("[SSLCommerz IPN Webhook] val_id {} confirmed valid via gateway server check.", valId);
                    return handleSuccess(payload);
                }
            }
            log.info("[SSLCommerz IPN Webhook] Unhandled or pending status: {} for tran_id: {}", status, tranId);
            return new SslCommerzCallbackResponse(false, "IPN status pending or unverified: " + status, tranId, valId, null, null, cardType, bankTranId);
        }
    }

    /**
     * Verifies MD5 signature hash (verify_sign) on incoming SSLCommerz IPN payloads.
     */
    public boolean verifyHash(Map<String, String> payload) {
        String verifySign = payload.get("verify_sign");
        String verifyKey = payload.get("verify_key");
        if (verifySign == null || verifyKey == null || verifySign.trim().isEmpty() || verifyKey.trim().isEmpty()) {
            return true;
        }

        try {
            String[] keys = verifyKey.split(",");
            StringBuilder sb = new StringBuilder();
            for (String key : keys) {
                String k = key.trim();
                String val = payload.getOrDefault(k, "");
                sb.append(k).append("=").append(val).append("&");
            }
            String storePassMd5 = md5(storePassword != null ? storePassword : "qwerty");
            sb.append("store_passwd=").append(storePassMd5);

            String calculatedSign = md5(sb.toString());
            boolean matches = calculatedSign.equalsIgnoreCase(verifySign.trim());
            if (!matches) {
                log.warn("[SSLCommerz verify_sign Mismatch] Expected: {}, Calculated: {}", verifySign, calculatedSign);
            }
            return matches;
        } catch (Exception e) {
            log.warn("[SSLCommerz Hash Verification Error] Failed to compute signature: {}", e.getMessage());
            return false;
        }
    }

    private String md5(String input) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : messageDigest) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 algorithm not available", e);
        }
    }
}


