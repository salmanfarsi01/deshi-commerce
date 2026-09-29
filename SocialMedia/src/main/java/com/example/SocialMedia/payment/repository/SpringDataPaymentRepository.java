package com.example.SocialMedia.payment.repository;

import com.example.SocialMedia.payment.model.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpringDataPaymentRepository extends JpaRepository<PaymentRecord, String> {
    Optional<PaymentRecord> findByOrderId(String orderId);
    Optional<PaymentRecord> findByTransactionId(String transactionId);
    List<PaymentRecord> findByUserId(String userId);
}
