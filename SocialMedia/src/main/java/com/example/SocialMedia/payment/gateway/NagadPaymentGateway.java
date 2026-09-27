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
public class NagadPaymentGateway implements PaymentGateway {

    @Override
    public PaymentInitiation initiate(PaymentRequestDto request) {
        String paymentRef = "NGD_" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        String checkoutUrl = "https://sandbox.mytgateway.com/nagad/check-out?paymentRefId=" + paymentRef;
        return new PaymentInitiation(
                paymentRef,
                PaymentStatus.INITIATED,
                checkoutUrl,
                "Redirect customer to Nagad checkout gateway portal."
        );
    }

    @Override
    public PaymentVerification verify(String transactionId) {
        return new PaymentVerification(
                transactionId,
                PaymentStatus.SUCCESS,
                true,
                "NGD_TRX_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                "Nagad payment successfully verified"
        );
    }

    @Override
    public PaymentRefund refund(String transactionId) {
        return new PaymentRefund(
                "NGD_REF_" + UUID.randomUUID().toString().substring(0, 8),
                transactionId,
                null,
                true,
                "Nagad wallet refund successful"
        );
    }

    @Override
    public PaymentMethod getSupportedMethod() {
        return PaymentMethod.NAGAD;
    }
}
