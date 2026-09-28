package com.example.SocialMedia.payment.dto;

import java.math.BigDecimal;

public class SslCommerzInitResponse {

    private String status;
    private String sessionkey;
    private String gatewayPageURL;
    private String orderId;
    private String tranId;
    private BigDecimal amount;
    private String currency;
    private String message;

    public SslCommerzInitResponse() {
    }

    public SslCommerzInitResponse(String status, String sessionkey, String gatewayPageURL,
                                  String orderId, String tranId, BigDecimal amount,
                                  String currency, String message) {
        this.status = status;
        this.sessionkey = sessionkey;
        this.gatewayPageURL = gatewayPageURL;
        this.orderId = orderId;
        this.tranId = tranId;
        this.amount = amount;
        this.currency = currency;
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSessionkey() {
        return sessionkey;
    }

    public void setSessionkey(String sessionkey) {
        this.sessionkey = sessionkey;
    }

    public String getGatewayPageURL() {
        return gatewayPageURL;
    }

    public void setGatewayPageURL(String gatewayPageURL) {
        this.gatewayPageURL = gatewayPageURL;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getTranId() {
        return tranId;
    }

    public void setTranId(String tranId) {
        this.tranId = tranId;
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

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
