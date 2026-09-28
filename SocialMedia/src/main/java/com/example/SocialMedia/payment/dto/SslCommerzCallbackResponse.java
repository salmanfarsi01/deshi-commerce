package com.example.SocialMedia.payment.dto;

import java.math.BigDecimal;

public class SslCommerzCallbackResponse {

    private boolean success;
    private String message;
    private String tranId;
    private String valId;
    private String orderId;
    private BigDecimal amount;
    private String cardType;
    private String bankTranId;

    public SslCommerzCallbackResponse() {
    }

    public SslCommerzCallbackResponse(boolean success, String message, String tranId,
                                      String valId, String orderId, BigDecimal amount,
                                      String cardType, String bankTranId) {
        this.success = success;
        this.message = message;
        this.tranId = tranId;
        this.valId = valId;
        this.orderId = orderId;
        this.amount = amount;
        this.cardType = cardType;
        this.bankTranId = bankTranId;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTranId() {
        return tranId;
    }

    public void setTranId(String tranId) {
        this.tranId = tranId;
    }

    public String getValId() {
        return valId;
    }

    public void setValId(String valId) {
        this.valId = valId;
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

    public String getCardType() {
        return cardType;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType;
    }

    public String getBankTranId() {
        return bankTranId;
    }

    public void setBankTranId(String bankTranId) {
        this.bankTranId = bankTranId;
    }
}
