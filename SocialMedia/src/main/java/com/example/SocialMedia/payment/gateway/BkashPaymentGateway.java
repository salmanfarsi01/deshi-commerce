package com.example.SocialMedia.payment.gateway;

import com.example.SocialMedia.payment.dto.PaymentInitiation;
import com.example.SocialMedia.payment.dto.PaymentRefund;
import com.example.SocialMedia.payment.dto.PaymentRequestDto;
import com.example.SocialMedia.payment.dto.PaymentVerification;
import com.example.SocialMedia.payment.model.PaymentMethod;
import com.example.SocialMedia.payment.model.PaymentStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class BkashPaymentGateway implements PaymentGateway {

    @Override
    public PaymentInitiation initiate(PaymentRequestDto request) {
        String paymentId = "BK_" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        String checkoutUrl = "https://sandbox.payment.bkash.com/redirect/checkout?paymentID=" + paymentId;
        return new PaymentInitiation(
                paymentId,
                PaymentStatus.INITIATED,
                checkoutUrl,
                "Redirect customer to bKash payment gateway URL or bKash App to enter PIN."
        );
    }

    @Override
    public PaymentVerification verify(String transactionId) {
        // Simulates bKash Execute API callback verification
        return new PaymentVerification(
                transactionId,
                PaymentStatus.SUCCESS,
                true,
                "BKASH_TRX_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                "bKash transaction successfully verified"
        );
    }

    @Override
    public PaymentRefund refund(String transactionId) {
        return new PaymentRefund(
                "BK_REF_" + UUID.randomUUID().toString().substring(0, 8),
                transactionId,
                null,
                true,
                "bKash wallet refund successful"
        );
    }

    @Override
    public PaymentMethod getSupportedMethod() {
        return PaymentMethod.BKASH;
    }
}
