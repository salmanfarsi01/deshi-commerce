package com.example.SocialMedia.chat.dto;

import java.util.ArrayList;
import java.util.List;

public class ChatConversationDto {
    private String id;
    private String userId;
    private String userName;
    private String userPhone;
    private String userEmail;
    private String userAvatar;
    private String lastMessage;
    private String lastMessageTime;
    private int unreadAdminCount;
    private int unreadUserCount;
    private String status;
    private List<ChatMessageDto> messages = new ArrayList<>();

    public ChatConversationDto() {
    }

    public ChatConversationDto(String id, String userId, String userName, String userPhone,
                               String userEmail, String userAvatar, String lastMessage,
                               String lastMessageTime, int unreadAdminCount, int unreadUserCount,
                               String status, List<ChatMessageDto> messages) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userPhone = userPhone;
        this.userEmail = userEmail;
        this.userAvatar = userAvatar;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
        this.unreadAdminCount = unreadAdminCount;
        this.unreadUserCount = unreadUserCount;
        this.status = status;
        this.messages = messages != null ? messages : new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserPhone() {
        return userPhone;
    }

    public void setUserPhone(String userPhone) {
        this.userPhone = userPhone;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserAvatar() {
        return userAvatar;
    }

    public void setUserAvatar(String userAvatar) {
        this.userAvatar = userAvatar;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public String getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(String lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }

    public int getUnreadAdminCount() {
        return unreadAdminCount;
    }

    public void setUnreadAdminCount(int unreadAdminCount) {
        this.unreadAdminCount = unreadAdminCount;
    }

    public int getUnreadUserCount() {
        return unreadUserCount;
    }

    public void setUnreadUserCount(int unreadUserCount) {
        this.unreadUserCount = unreadUserCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<ChatMessageDto> getMessages() {
        return messages;
    }

    public void setMessages(List<ChatMessageDto> messages) {
        this.messages = messages;
    }
}
