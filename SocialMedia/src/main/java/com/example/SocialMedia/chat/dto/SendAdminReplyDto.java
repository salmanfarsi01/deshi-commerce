package com.example.SocialMedia.chat.dto;

public class SendAdminReplyDto {
    private String conversationId;
    private String adminName;
    private String text;

    public SendAdminReplyDto() {
    }

    public SendAdminReplyDto(String conversationId, String adminName, String text) {
        this.conversationId = conversationId;
        this.adminName = adminName;
        this.text = text;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getAdminName() {
        return adminName;
    }

    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
