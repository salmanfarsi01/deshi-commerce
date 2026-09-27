package com.example.SocialMedia.order.model;

import java.util.Collections;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    FAILED,
    RETURN_REQUESTED,
    RETURNED;

    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = new EnumMap<>(OrderStatus.class);

    static {
        VALID_TRANSITIONS.put(PENDING, EnumSet.of(CONFIRMED, CANCELLED, FAILED));
        VALID_TRANSITIONS.put(CONFIRMED, EnumSet.of(PROCESSING, CANCELLED));
        VALID_TRANSITIONS.put(PROCESSING, EnumSet.of(SHIPPED, CANCELLED));
        VALID_TRANSITIONS.put(SHIPPED, EnumSet.of(DELIVERED, CANCELLED));
        VALID_TRANSITIONS.put(DELIVERED, EnumSet.of(RETURN_REQUESTED));
        VALID_TRANSITIONS.put(RETURN_REQUESTED, EnumSet.of(RETURNED, DELIVERED));
        VALID_TRANSITIONS.put(CANCELLED, Collections.emptySet());
        VALID_TRANSITIONS.put(FAILED, Collections.emptySet());
        VALID_TRANSITIONS.put(RETURNED, Collections.emptySet());
    }

    public boolean canTransitionTo(OrderStatus nextStatus) {
        Set<OrderStatus> allowed = VALID_TRANSITIONS.get(this);
        return allowed != null && allowed.contains(nextStatus);
    }
}
