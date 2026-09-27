package com.example.SocialMedia.order.dto;

import com.example.SocialMedia.payment.model.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateOrderRequest {

    @NotBlank(message = "Delivery address ID is required")
    private String addressId;

    @NotNull(message = "Payment method is required (e.g. COD, BKASH, NAGAD, SSLCOMMERZ)")
    private PaymentMethod paymentMethod;

    private String notes;

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(String addressId, PaymentMethod paymentMethod, String notes) {
        this.addressId = addressId;
        this.paymentMethod = paymentMethod;
        this.notes = notes;
    }

    public String getAddressId() {
        return addressId;
    }

    public void setAddressId(String addressId) {
        this.addressId = addressId;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
