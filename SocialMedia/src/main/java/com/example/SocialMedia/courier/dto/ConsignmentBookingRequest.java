package com.example.SocialMedia.courier.dto;

import jakarta.validation.constraints.NotBlank;

public class ConsignmentBookingRequest {

    @NotBlank(message = "Order ID is required")
    private String orderId;

    private String courier; // "STEADFAST", "PATHAO", "REDX"
    private String itemDescription;
    private String specialInstruction;

    public ConsignmentBookingRequest() {
    }

    public ConsignmentBookingRequest(String orderId, String courier, String itemDescription, String specialInstruction) {
        this.orderId = orderId;
        this.courier = courier;
        this.itemDescription = itemDescription;
        this.specialInstruction = specialInstruction;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getCourier() {
        return courier;
    }

    public void setCourier(String courier) {
        this.courier = courier;
    }

    public String getItemDescription() {
        return itemDescription;
    }

    public void setItemDescription(String itemDescription) {
        this.itemDescription = itemDescription;
    }

    public String getSpecialInstruction() {
        return specialInstruction;
    }

    public void setSpecialInstruction(String specialInstruction) {
        this.specialInstruction = specialInstruction;
    }
}
