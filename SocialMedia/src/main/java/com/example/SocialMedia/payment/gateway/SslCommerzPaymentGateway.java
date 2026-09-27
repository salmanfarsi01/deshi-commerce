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
public class SslCommerzPaymentGateway implements PaymentGateway {

    @Override
    public PaymentInitiation initiate(PaymentRequestDto request) {
        String sessionKey = "SSL_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        String gatewayUrl = "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?sessionkey=" + sessionKey;
        return new PaymentInitiation(
                sessionKey,
                PaymentStatus.INITIATED,
                gatewayUrl,
                "Redirect customer to SSLCommerz unified payment portal (Supports Visa, Mastercard, AMEX, Internet Banking, Upay, Rocket)."
        );
    }

    @Override
    public PaymentVerification verify(String transactionId) {
        return new PaymentVerification(
                transactionId,
                PaymentStatus.SUCCESS,
                true,
                "SSL_VAL_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                "SSLCommerz IPN / validation successful"
        );
    }

    @Override
    public PaymentRefund refund(String transactionId) {
        return new PaymentRefund(
                "SSL_REF_" + UUID.randomUUID().toString().substring(0, 8),
                transactionId,
                null,
                true,
                "SSLCommerz refund initiated"
        );
    }

    @Override
    public PaymentMethod getSupportedMethod() {
        return PaymentMethod.SSLCOMMERZ;
    }
}
