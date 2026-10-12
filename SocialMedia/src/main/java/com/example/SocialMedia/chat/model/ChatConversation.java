package com.example.SocialMedia.chat.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_conversations")
public class ChatConversation {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "user_name", length = 150)
    private String userName;

    @Column(name = "user_phone", length = 30)
    private String userPhone;

    @Column(name = "user_email", length = 100)
    private String userEmail;

    @Column(name = "user_avatar", length = 1000)
    private String userAvatar;

    @Column(name = "last_message", length = 2000)
    private String lastMessage;

    @Column(name = "last_message_time", length = 50)
    private String lastMessageTime;

    @Column(name = "unread_admin_count", nullable = false)
    private int unreadAdminCount = 0;

    @Column(name = "unread_user_count", nullable = false)
    private int unreadUserCount = 0;

    @Column(name = "status", length = 30, nullable = false)
    private String status = "OPEN";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<ChatMessage> messages = new ArrayList<>();

    public ChatConversation() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public ChatConversation(String id, String userId, String userName, String userPhone,
                            String userEmail, String userAvatar) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userPhone = userPhone;
        this.userEmail = userEmail;
        this.userAvatar = userAvatar;
        this.status = "OPEN";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void addMessage(ChatMessage message) {
        messages.add(message);
        message.setConversation(this);
        this.lastMessage = message.getText();
        this.lastMessageTime = message.getTimestamp();
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<ChatMessage> getMessages() {
        return messages;
    }

    public void setMessages(List<ChatMessage> messages) {
        this.messages = messages;
    }
}
