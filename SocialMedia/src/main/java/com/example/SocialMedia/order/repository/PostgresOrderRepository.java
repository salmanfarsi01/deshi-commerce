package com.example.SocialMedia.order.repository;

import com.example.SocialMedia.order.model.Order;
import com.example.SocialMedia.order.model.OrderStatus;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class PostgresOrderRepository implements OrderRepository {

    private final SpringDataOrderRepository springDataOrderRepository;

    public PostgresOrderRepository(SpringDataOrderRepository springDataOrderRepository) {
        this.springDataOrderRepository = springDataOrderRepository;
    }

    @Override
    public Order save(Order order) {
        return springDataOrderRepository.save(order);
    }

    @Override
    public Optional<Order> findById(String id) {
        return springDataOrderRepository.findById(id);
    }

    @Override
    public Optional<Order> findByOrderNumber(String orderNumber) {
        return springDataOrderRepository.findByOrderNumberIgnoreCase(orderNumber);
    }

    @Override
    public List<Order> findByUserId(String userId) {
        return springDataOrderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<Order> findAll() {
        return springDataOrderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public List<Order> findByStatus(OrderStatus status) {
        return springDataOrderRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    @Override
    public List<Order> findWithFilter(OrderStatus status, String userId, String search) {
        return springDataOrderRepository.findWithFilter(
                status,
                (userId != null && !userId.isBlank()) ? userId.trim() : null,
                (search != null && !search.isBlank()) ? search.trim() : null
        );
    }

    @Override
    public long count() {
        return springDataOrderRepository.count();
    }
}
