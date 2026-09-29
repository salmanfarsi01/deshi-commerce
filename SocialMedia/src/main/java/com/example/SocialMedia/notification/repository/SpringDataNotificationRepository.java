package com.example.SocialMedia.notification.repository;

import com.example.SocialMedia.notification.model.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpringDataNotificationRepository extends JpaRepository<NotificationLog, String> {

    List<NotificationLog> findByOrderIdOrderByCreatedAtDesc(String orderId);

    List<NotificationLog> findByUserIdOrderByCreatedAtDesc(String userId);

    List<NotificationLog> findAllByOrderByCreatedAtDesc();
}
