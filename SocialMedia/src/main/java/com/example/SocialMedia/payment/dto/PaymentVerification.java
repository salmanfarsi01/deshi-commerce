package com.example.SocialMedia.payment.dto;

import com.example.SocialMedia.payment.model.PaymentStatus;

public class PaymentVerification {

    private String transactionId;
    private PaymentStatus status;
    private boolean successful;
    private String gatewayReference;
    private String message;

    public PaymentVerification() {
    }

    public PaymentVerification(String transactionId, PaymentStatus status, boolean successful, String gatewayReference, String message) {
        this.transactionId = transactionId;
        this.status = status;
        this.successful = successful;
        this.gatewayReference = gatewayReference;
        this.message = message;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public boolean isSuccessful() {
        return successful;
    }

    public void setSuccessful(boolean successful) {
        this.successful = successful;
    }

    public String getGatewayReference() {
        return gatewayReference;
    }

    public void setGatewayReference(String gatewayReference) {
        this.gatewayReference = gatewayReference;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
