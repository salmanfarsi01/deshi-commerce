package com.example.SocialMedia.payment.dto;

import java.math.BigDecimal;

public class PaymentRefund {

    private String refundId;
    private String transactionId;
    private BigDecimal amount;
    private boolean successful;
    private String message;

    public PaymentRefund() {
    }

    public PaymentRefund(String refundId, String transactionId, BigDecimal amount, boolean successful, String message) {
        this.refundId = refundId;
        this.transactionId = transactionId;
        this.amount = amount;
        this.successful = successful;
        this.message = message;
    }

    public String getRefundId() {
        return refundId;
    }

    public void setRefundId(String refundId) {
        this.refundId = refundId;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public boolean isSuccessful() {
        return successful;
    }

    public void setSuccessful(boolean successful) {
        this.successful = successful;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
