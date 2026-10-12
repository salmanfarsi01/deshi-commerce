package com.example.SocialMedia.chat.dto;

public class MarkChatReadDto {
    private String role; // "USER" or "ADMIN"

    public MarkChatReadDto() {
    }

    public MarkChatReadDto(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
