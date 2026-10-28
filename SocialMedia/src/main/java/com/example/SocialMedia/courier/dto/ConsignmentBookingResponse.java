package com.example.SocialMedia.courier.dto;

public class ConsignmentBookingResponse {

    private String orderId;
    private String orderNumber;
    private String consignmentId;
    private String trackingCode;
    private String trackingUrl;
    private String courierName;
    private String status;
    private String message;

    public ConsignmentBookingResponse() {
    }

    public ConsignmentBookingResponse(String orderId, String orderNumber, String consignmentId,
                                      String trackingCode, String trackingUrl, String courierName,
                                      String status, String message) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.consignmentId = consignmentId;
        this.trackingCode = trackingCode;
        this.trackingUrl = trackingUrl;
        this.courierName = courierName;
        this.status = status;
        this.message = message;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getConsignmentId() {
        return consignmentId;
    }

    public void setConsignmentId(String consignmentId) {
        this.consignmentId = consignmentId;
    }

    public String getTrackingCode() {
        return trackingCode;
    }

    public void setTrackingCode(String trackingCode) {
        this.trackingCode = trackingCode;
    }

    public String getTrackingUrl() {
        return trackingUrl;
    }

    public void setTrackingUrl(String trackingUrl) {
        this.trackingUrl = trackingUrl;
    }

    public String getCourierName() {
        return courierName;
    }

    public void setCourierName(String courierName) {
        this.courierName = courierName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
