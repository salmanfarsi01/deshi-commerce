package com.example.SocialMedia.notification.repository;

import com.example.SocialMedia.notification.model.NotificationLog;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class PostgresNotificationRepository implements NotificationRepository {

    private final SpringDataNotificationRepository springDataNotificationRepository;

    public PostgresNotificationRepository(SpringDataNotificationRepository springDataNotificationRepository) {
        this.springDataNotificationRepository = springDataNotificationRepository;
    }

    @Override
    public NotificationLog save(NotificationLog log) {
        return springDataNotificationRepository.save(log);
    }

    @Override
    public Optional<NotificationLog> findById(String id) {
        return springDataNotificationRepository.findById(id);
    }

    @Override
    public List<NotificationLog> findByOrderId(String orderId) {
        return springDataNotificationRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
    }

    @Override
    public List<NotificationLog> findByUserId(String userId) {
        return springDataNotificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<NotificationLog> findAll() {
        return springDataNotificationRepository.findAllByOrderByCreatedAtDesc();
    }
}
