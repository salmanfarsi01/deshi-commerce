package com.example.SocialMedia.payment.dto;

import com.example.SocialMedia.payment.model.PaymentMethod;
import com.example.SocialMedia.payment.model.PaymentRecord;
import com.example.SocialMedia.payment.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;

public class PaymentResponse {

    private String paymentId;
    private String orderId;
    private BigDecimal amount;
    private String currency;
    private PaymentMethod method;
    private PaymentStatus status;
    private String transactionId;
    private String gatewayPaymentUrl;
    private Instant createdAt;

    public PaymentResponse() {
    }

    public static PaymentResponse fromEntity(PaymentRecord record) {
        if (record == null) {
            return null;
        }
        PaymentResponse dto = new PaymentResponse();
        dto.setPaymentId(record.getId());
        dto.setOrderId(record.getOrderId());
        dto.setAmount(record.getAmount());
        dto.setCurrency(record.getCurrency());
        dto.setMethod(record.getMethod());
        dto.setStatus(record.getStatus());
        dto.setTransactionId(record.getTransactionId());
        dto.setGatewayPaymentUrl(record.getGatewayPaymentUrl());
        dto.setCreatedAt(record.getCreatedAt());
        return dto;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
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
