package com.example.SocialMedia.payment.dto;

import jakarta.validation.constraints.NotBlank;

public class PaymentVerifyRequest {

    @NotBlank(message = "Transaction ID or Session ID is required")
    private String transactionId;

    public PaymentVerifyRequest() {
    }

    public PaymentVerifyRequest(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
}
