package com.example.SocialMedia.payment.service;

import com.example.SocialMedia.common.exception.BadRequestException;
import com.example.SocialMedia.common.exception.ResourceNotFoundException;
import com.example.SocialMedia.payment.dto.*;
import com.example.SocialMedia.payment.gateway.PaymentGateway;
import com.example.SocialMedia.payment.model.PaymentMethod;
import com.example.SocialMedia.payment.model.PaymentRecord;
import com.example.SocialMedia.payment.model.PaymentStatus;
import com.example.SocialMedia.payment.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final Map<PaymentMethod, PaymentGateway> gatewayMap;

    public PaymentService(PaymentRepository paymentRepository, List<PaymentGateway> gateways) {
        this.paymentRepository = paymentRepository;
        this.gatewayMap = gateways.stream()
                .collect(Collectors.toMap(PaymentGateway::getSupportedMethod, g -> g));
    }

    public List<PaymentMethodDto> getAvailableMethods() {
        return List.of(
                new PaymentMethodDto(PaymentMethod.COD, "Cash on Delivery (COD)", "Pay cash in BDT upon delivery across Bangladesh", "https://cdn-icons-png.flaticon.com/512/2331/2331941.png", true),
                new PaymentMethodDto(PaymentMethod.BKASH, "bKash MFS", "Instant checkout using bKash account or PIN", "https://freepnglogo.com/images/all_img/1701588805bkash-app-logo.png", true),
                new PaymentMethodDto(PaymentMethod.NAGAD, "Nagad MFS", "Seamless checkout using Nagad wallet", "https://freepnglogo.com/images/all_img/1701589255nagad-logo.png", true),
                new PaymentMethodDto(PaymentMethod.SSLCOMMERZ, "SSLCommerz Gateway", "Cards (Visa, Mastercard, AMEX), Internet Banking & other MFS", "https://sslcommerz.com/wp-content/uploads/2021/11/logo.png", true)
        );
    }

    public PaymentResponse initiatePayment(String orderId, String userId, BigDecimal amount,
                                           PaymentMethod method, String customerPhone, String customerName) {
        PaymentGateway gateway = gatewayMap.get(method);
        if (gateway == null) {
            throw new BadRequestException("Unsupported payment method: " + method);
        }

        PaymentRequestDto requestDto = new PaymentRequestDto(orderId, userId, amount, "BDT", method, customerPhone, customerName);
        PaymentInitiation initiation = gateway.initiate(requestDto);

        String paymentId = "pay_" + UUID.randomUUID().toString().substring(0, 8);
        PaymentRecord record = new PaymentRecord(
                paymentId,
                orderId,
                userId,
                amount,
                "BDT",
                method,
                initiation.getStatus(),
                initiation.getTransactionId(),
                initiation.getPaymentUrl()
        );

        paymentRepository.save(record);
        return PaymentResponse.fromEntity(record);
    }

    public PaymentVerification verifyPayment(String transactionId) {
        PaymentRecord record = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for transaction " + transactionId));

        PaymentGateway gateway = gatewayMap.get(record.getMethod());
        if (gateway == null) {
            throw new BadRequestException("Gateway not found for method " + record.getMethod());
        }

        PaymentVerification verification = gateway.verify(transactionId);
        if (verification.isSuccessful()) {
            record.setStatus(PaymentStatus.SUCCESS);
        } else {
            record.setStatus(PaymentStatus.FAILED);
        }
        paymentRepository.save(record);
        return verification;
    }

    public PaymentResponse getPaymentByOrderId(String orderId) {
        PaymentRecord record = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", orderId));
        return PaymentResponse.fromEntity(record);
    }

    public PaymentRecord getRawPaymentRecord(String orderId) {
        return paymentRepository.findByOrderId(orderId).orElse(null);
    }
}
