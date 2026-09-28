package com.example.SocialMedia.order.dto;

import com.example.SocialMedia.order.model.OrderStatus;
import jakarta.validation.constraints.NotBlank;

public class OrderTrackingUpdateRequest {

    @NotBlank(message = "Courier name is required (e.g. Steadfast, Pathao, RedX, eCourier)")
    private String courierName;

    @NotBlank(message = "Tracking number or consignment ID is required")
    private String trackingNumber;

    private String trackingUrl;

    private String estimatedDeliveryDate;

    private OrderStatus status = OrderStatus.SHIPPED;

    private String note;

    public OrderTrackingUpdateRequest() {
    }

    public OrderTrackingUpdateRequest(String courierName, String trackingNumber, String trackingUrl,
                                     String estimatedDeliveryDate, OrderStatus status, String note) {
        this.courierName = courierName;
        this.trackingNumber = trackingNumber;
        this.trackingUrl = trackingUrl;
        this.estimatedDeliveryDate = estimatedDeliveryDate;
        this.status = status != null ? status : OrderStatus.SHIPPED;
        this.note = note;
    }

    public String getCourierName() {
        return courierName;
    }

    public void setCourierName(String courierName) {
        this.courierName = courierName;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getTrackingUrl() {
        return trackingUrl;
    }

    public void setTrackingUrl(String trackingUrl) {
        this.trackingUrl = trackingUrl;
    }

    public String getEstimatedDeliveryDate() {
        return estimatedDeliveryDate;
    }

    public void setEstimatedDeliveryDate(String estimatedDeliveryDate) {
        this.estimatedDeliveryDate = estimatedDeliveryDate;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
