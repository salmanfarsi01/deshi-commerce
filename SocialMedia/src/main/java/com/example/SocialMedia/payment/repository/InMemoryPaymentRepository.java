package com.example.SocialMedia.payment.repository;

import com.example.SocialMedia.payment.model.PaymentRecord;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "app.database.in-memory", havingValue = "true")
public class InMemoryPaymentRepository implements PaymentRepository {

    private final Map<String, PaymentRecord> recordMap = new ConcurrentHashMap<>();

    @Override
    public PaymentRecord save(PaymentRecord record) {
        recordMap.put(record.getId(), record);
        return record;
    }

    @Override
    public Optional<PaymentRecord> findById(String id) {
        return Optional.ofNullable(recordMap.get(id));
    }

    @Override
    public Optional<PaymentRecord> findByOrderId(String orderId) {
        return recordMap.values().stream()
                .filter(r -> orderId.equals(r.getOrderId()))
                .findFirst();
    }

    @Override
    public Optional<PaymentRecord> findByTransactionId(String transactionId) {
        return recordMap.values().stream()
                .filter(r -> transactionId.equalsIgnoreCase(r.getTransactionId()))
                .findFirst();
    }

    @Override
    public List<PaymentRecord> findByUserId(String userId) {
        return recordMap.values().stream()
                .filter(r -> userId.equals(r.getUserId()))
                .collect(Collectors.toList());
    }
}
