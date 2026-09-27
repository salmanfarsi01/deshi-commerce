package com.example.SocialMedia.payment.model;

import java.math.BigDecimal;
import java.time.Instant;

public class PaymentRecord {

    private String id;
    private String orderId;
    private String userId;
    private BigDecimal amount;
    private String currency = "BDT";
    private PaymentMethod method;
    private PaymentStatus status;
    private String transactionId;
    private String gatewayPaymentUrl;
    private Instant createdAt;

    public PaymentRecord() {
        this.createdAt = Instant.now();
    }

    public PaymentRecord(String id, String orderId, String userId, BigDecimal amount,
                         String currency, PaymentMethod method, PaymentStatus status,
                         String transactionId, String gatewayPaymentUrl) {
        this.id = id;
        this.orderId = orderId;
        this.userId = userId;
        this.amount = amount;
        this.currency = currency != null ? currency : "BDT";
        this.method = method;
        this.status = status;
        this.transactionId = transactionId;
        this.gatewayPaymentUrl = gatewayPaymentUrl;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getGatewayPaymentUrl() {
        return gatewayPaymentUrl;
    }

    public void setGatewayPaymentUrl(String gatewayPaymentUrl) {
        this.gatewayPaymentUrl = gatewayPaymentUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
