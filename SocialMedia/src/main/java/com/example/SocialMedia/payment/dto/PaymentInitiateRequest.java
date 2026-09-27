package com.example.SocialMedia.payment.dto;

import com.example.SocialMedia.payment.model.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PaymentInitiateRequest {

    @NotBlank(message = "Order ID is required")
    private String orderId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod method;

    public PaymentInitiateRequest() {
    }

    public PaymentInitiateRequest(String orderId, PaymentMethod method) {
        this.orderId = orderId;
        this.method = method;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }
}
