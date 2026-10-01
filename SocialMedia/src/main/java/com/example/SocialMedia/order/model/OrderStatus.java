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
        VALID_TRANSITIONS.put(PENDING, EnumSet.of(CONFIRMED, PROCESSING, SHIPPED, CANCELLED, FAILED));
        VALID_TRANSITIONS.put(CONFIRMED, EnumSet.of(PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED));
        VALID_TRANSITIONS.put(PROCESSING, EnumSet.of(CONFIRMED, SHIPPED, DELIVERED, CANCELLED));
        VALID_TRANSITIONS.put(SHIPPED, EnumSet.of(PROCESSING, DELIVERED, RETURNED, CANCELLED));
        VALID_TRANSITIONS.put(DELIVERED, EnumSet.of(SHIPPED, RETURN_REQUESTED, RETURNED, CANCELLED));
        VALID_TRANSITIONS.put(RETURN_REQUESTED, EnumSet.of(RETURNED, DELIVERED, CANCELLED));
        VALID_TRANSITIONS.put(CANCELLED, EnumSet.of(PENDING, CONFIRMED));
        VALID_TRANSITIONS.put(FAILED, EnumSet.of(PENDING, CONFIRMED));
        VALID_TRANSITIONS.put(RETURNED, Collections.emptySet());
    }

    public boolean canTransitionTo(OrderStatus nextStatus) {
        if (this == nextStatus) {
            return true;
        }
        Set<OrderStatus> allowed = VALID_TRANSITIONS.get(this);
        return allowed != null && allowed.contains(nextStatus);
    }
}
