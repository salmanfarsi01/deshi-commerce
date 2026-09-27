package com.example.SocialMedia.payment.gateway;

import com.example.SocialMedia.payment.dto.PaymentInitiation;
import com.example.SocialMedia.payment.dto.PaymentRefund;
import com.example.SocialMedia.payment.dto.PaymentRequestDto;
import com.example.SocialMedia.payment.dto.PaymentVerification;
import com.example.SocialMedia.payment.model.PaymentMethod;

public interface PaymentGateway {

    PaymentInitiation initiate(PaymentRequestDto request);

    PaymentVerification verify(String transactionId);

    PaymentRefund refund(String transactionId);

    PaymentMethod getSupportedMethod();
}
