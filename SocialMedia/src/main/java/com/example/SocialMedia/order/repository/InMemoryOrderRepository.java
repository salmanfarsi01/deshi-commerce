package com.example.SocialMedia.order.repository;

import com.example.SocialMedia.order.model.Order;
import com.example.SocialMedia.order.model.OrderStatus;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class InMemoryOrderRepository implements OrderRepository {

    private final Map<String, Order> orderMap = new ConcurrentHashMap<>();

    @Override
    public Order save(Order order) {
        orderMap.put(order.getId(), order);
        return order;
    }

    @Override
    public Optional<Order> findById(String id) {
        return Optional.ofNullable(orderMap.get(id));
    }

    @Override
    public Optional<Order> findByOrderNumber(String orderNumber) {
        return orderMap.values().stream()
                .filter(o -> orderNumber.equalsIgnoreCase(o.getOrderNumber()))
                .findFirst();
    }

    @Override
    public List<Order> findByUserId(String userId) {
        String currentTenant = com.example.SocialMedia.common.security.tenant.TenantContext.getTenantId();
        return orderMap.values().stream()
                .filter(o -> userId.equals(o.getUserId()))
                .filter(o -> o.getTenantId() == null || o.getTenantId().equalsIgnoreCase(currentTenant))
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findAll() {
        String currentTenant = com.example.SocialMedia.common.security.tenant.TenantContext.getTenantId();
        return orderMap.values().stream()
                .filter(o -> o.getTenantId() == null || o.getTenantId().equalsIgnoreCase(currentTenant))
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findByStatus(OrderStatus status) {
        String currentTenant = com.example.SocialMedia.common.security.tenant.TenantContext.getTenantId();
        return orderMap.values().stream()
                .filter(o -> status == o.getStatus())
                .filter(o -> o.getTenantId() == null || o.getTenantId().equalsIgnoreCase(currentTenant))
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Override
    public long count() {
        String currentTenant = com.example.SocialMedia.common.security.tenant.TenantContext.getTenantId();
        return orderMap.values().stream()
                .filter(o -> o.getTenantId() == null || o.getTenantId().equalsIgnoreCase(currentTenant))
                .count();
    }
}
