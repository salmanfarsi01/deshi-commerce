package com.example.SocialMedia.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class ForgotPasswordRequest {

    @NotBlank(message = "Phone number is required")
    private String phone;

    public ForgotPasswordRequest() {
    }

    public ForgotPasswordRequest(String phone) {
        this.phone = phone;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
