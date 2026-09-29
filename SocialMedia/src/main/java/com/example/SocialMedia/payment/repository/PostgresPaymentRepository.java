package com.example.SocialMedia.payment.repository;

import com.example.SocialMedia.payment.model.PaymentRecord;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Primary
public class PostgresPaymentRepository implements PaymentRepository {

    private final SpringDataPaymentRepository springDataPaymentRepository;

    public PostgresPaymentRepository(SpringDataPaymentRepository springDataPaymentRepository) {
        this.springDataPaymentRepository = springDataPaymentRepository;
    }

    @Override
    public PaymentRecord save(PaymentRecord record) {
        return springDataPaymentRepository.save(record);
    }

    @Override
    public Optional<PaymentRecord> findById(String id) {
        return springDataPaymentRepository.findById(id);
    }

    @Override
    public Optional<PaymentRecord> findByOrderId(String orderId) {
        return springDataPaymentRepository.findByOrderId(orderId);
    }

    @Override
    public Optional<PaymentRecord> findByTransactionId(String transactionId) {
        return springDataPaymentRepository.findByTransactionId(transactionId);
    }

    @Override
    public List<PaymentRecord> findByUserId(String userId) {
        return springDataPaymentRepository.findByUserId(userId);
    }
}
