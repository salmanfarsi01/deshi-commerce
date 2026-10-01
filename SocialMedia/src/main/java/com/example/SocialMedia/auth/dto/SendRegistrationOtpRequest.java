package com.example.SocialMedia.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class SendRegistrationOtpRequest {

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String name;

    public SendRegistrationOtpRequest() {
    }

    public SendRegistrationOtpRequest(String phone, String name) {
        this.phone = phone;
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
