package com.example.SocialMedia.chat.dto;

import java.time.Instant;

public class ChatMessageDto {
    private String id;
    private String conversationId;
    private String sender;
    private String senderName;
    private String senderAvatar;
    private String text;
    private String timestamp;
    private boolean isRead;
    private Instant createdAt;

    public ChatMessageDto() {
    }

    public ChatMessageDto(String id, String conversationId, String sender, String senderName,
                          String senderAvatar, String text, String timestamp, boolean isRead,
                          Instant createdAt) {
        this.id = id;
        this.conversationId = conversationId;
        this.sender = sender;
        this.senderName = senderName;
        this.senderAvatar = senderAvatar;
        this.text = text;
        this.timestamp = timestamp;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderAvatar() {
        return senderAvatar;
    }

    public void setSenderAvatar(String senderAvatar) {
        this.senderAvatar = senderAvatar;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
