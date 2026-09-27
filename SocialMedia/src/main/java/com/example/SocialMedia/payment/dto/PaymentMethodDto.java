package com.example.SocialMedia.payment.dto;

import com.example.SocialMedia.payment.model.PaymentMethod;

public class PaymentMethodDto {

    private PaymentMethod method;
    private String name;
    private String description;
    private String icon;
    private boolean available;

    public PaymentMethodDto() {
    }

    public PaymentMethodDto(PaymentMethod method, String name, String description, String icon, boolean available) {
        this.method = method;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.available = available;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
