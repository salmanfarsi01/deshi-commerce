package com.example.SocialMedia.payment.dto;

import com.example.SocialMedia.payment.model.PaymentMethod;
import java.math.BigDecimal;

public class PaymentRequestDto {

    private String orderId;
    private String userId;
    private BigDecimal amount;
    private String currency;
    private PaymentMethod method;
    private String customerPhone;
    private String customerName;

    public PaymentRequestDto() {
    }

    public PaymentRequestDto(String orderId, String userId, BigDecimal amount, String currency,
                             PaymentMethod method, String customerPhone, String customerName) {
        this.orderId = orderId;
        this.userId = userId;
        this.amount = amount;
        this.currency = currency;
        this.method = method;
        this.customerPhone = customerPhone;
        this.customerName = customerName;
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

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
}
