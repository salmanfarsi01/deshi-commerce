package com.example.SocialMedia.payment.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payment_records")
public class PaymentRecord {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "order_id", length = 64)
    private String orderId;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", length = 10)
    private String currency = "BDT";

    @Enumerated(EnumType.STRING)
    @Column(name = "method", length = 30)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    private PaymentStatus status;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "gateway_payment_url", columnDefinition = "TEXT")
    private String gatewayPaymentUrl;

    @Column(name = "created_at", nullable = false)
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
