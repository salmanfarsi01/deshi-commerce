package com.example.SocialMedia.notification.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "notification_logs")
public class NotificationLog {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 20)
    private NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(name = "event", nullable = false, length = 30)
    private NotificationEvent event;

    @Column(name = "recipient", nullable = false, length = 150)
    private String recipient;

    @Column(name = "subject", length = 255)
    private String subject;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private NotificationStatus status;

    @Column(name = "order_id", length = 64)
    private String orderId;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public NotificationLog() {
        this.createdAt = Instant.now();
    }

    public NotificationLog(String id, NotificationChannel channel, NotificationEvent event,
                           String recipient, String subject, String message,
                           NotificationStatus status, String orderId, String userId) {
        this.id = id;
        this.channel = channel;
        this.event = event;
        this.recipient = recipient;
        this.subject = subject;
        this.message = message;
        this.status = status;
        this.orderId = orderId;
        this.userId = userId;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public NotificationChannel getChannel() {
        return channel;
    }

    public void setChannel(NotificationChannel channel) {
        this.channel = channel;
    }

    public NotificationEvent getEvent() {
        return event;
    }

    public void setEvent(NotificationEvent event) {
        this.event = event;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public void setStatus(NotificationStatus status) {
        this.status = status;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
