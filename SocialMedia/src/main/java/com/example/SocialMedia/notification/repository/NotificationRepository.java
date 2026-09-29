package com.example.SocialMedia.notification.repository;

import com.example.SocialMedia.notification.model.NotificationLog;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository {

    NotificationLog save(NotificationLog log);

    Optional<NotificationLog> findById(String id);

    List<NotificationLog> findByOrderId(String orderId);

    List<NotificationLog> findByUserId(String userId);

    List<NotificationLog> findAll();
}
