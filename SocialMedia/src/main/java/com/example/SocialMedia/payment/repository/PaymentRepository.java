package com.example.SocialMedia.payment.repository;

import com.example.SocialMedia.payment.model.PaymentRecord;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository {

    PaymentRecord save(PaymentRecord record);

    Optional<PaymentRecord> findById(String id);

    Optional<PaymentRecord> findByOrderId(String orderId);

    Optional<PaymentRecord> findByTransactionId(String transactionId);

    List<PaymentRecord> findByUserId(String userId);
}
