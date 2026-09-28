package com.example.SocialMedia.order.repository;

import com.example.SocialMedia.order.model.Order;
import com.example.SocialMedia.order.model.OrderStatus;

import java.util.List;
import java.util.Optional;

public interface OrderRepository {

    Order save(Order order);

    Optional<Order> findById(String id);

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByUserId(String userId);

    List<Order> findAll();

    List<Order> findByStatus(OrderStatus status);

    List<Order> findWithFilter(OrderStatus status, String userId, String search);

    long count();
}
