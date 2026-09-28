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
        return findWithFilter(status, null, null);
    }

    @Override
    public List<Order> findWithFilter(OrderStatus status, String userId, String search) {
        String currentTenant = com.example.SocialMedia.common.security.tenant.TenantContext.getTenantId();
        String q = search != null ? search.trim().toLowerCase() : null;

        return orderMap.values().stream()
                .filter(o -> o.getTenantId() == null || o.getTenantId().equalsIgnoreCase(currentTenant))
                .filter(o -> status == null || o.getStatus() == status)
                .filter(o -> userId == null || userId.isBlank() || o.getUserId().equalsIgnoreCase(userId.trim()))
                .filter(o -> {
                    if (q == null || q.isBlank()) {
                        return true;
                    }
                    boolean matchesOrderNumber = o.getOrderNumber() != null && o.getOrderNumber().toLowerCase().contains(q);
                    boolean matchesAddress = false;
                    if (o.getShippingAddress() != null) {
                        String name = o.getShippingAddress().getName() != null ? o.getShippingAddress().getName().toLowerCase() : "";
                        String phone = o.getShippingAddress().getPhone() != null ? o.getShippingAddress().getPhone().toLowerCase() : "";
                        String district = o.getShippingAddress().getDistrict() != null ? o.getShippingAddress().getDistrict().toLowerCase() : "";
                        matchesAddress = name.contains(q) || phone.contains(q) || district.contains(q);
                    }
                    return matchesOrderNumber || matchesAddress;
                })
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
