package com.example.SocialMedia.payment.dto;

import com.example.SocialMedia.payment.model.PaymentStatus;

public class PaymentInitiation {

    private String transactionId;
    private PaymentStatus status;
    private String paymentUrl;
    private String instructions;

    public PaymentInitiation() {
    }

    public PaymentInitiation(String transactionId, PaymentStatus status, String paymentUrl, String instructions) {
        this.transactionId = transactionId;
        this.status = status;
        this.paymentUrl = paymentUrl;
        this.instructions = instructions;
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

    public String getPaymentUrl() {
        return paymentUrl;
    }

    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
}
