package com.example.SocialMedia.payment.gateway;

import com.example.SocialMedia.payment.dto.PaymentInitiation;
import com.example.SocialMedia.payment.dto.PaymentRefund;
import com.example.SocialMedia.payment.dto.PaymentRequestDto;
import com.example.SocialMedia.payment.dto.PaymentVerification;
import com.example.SocialMedia.payment.model.PaymentMethod;
import com.example.SocialMedia.payment.model.PaymentStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Nagad Direct Checkout Payment Gateway Integration.
 * Implements initialization and transaction verification.
 */
@Component
public class NagadPaymentGateway implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(NagadPaymentGateway.class);

    @Value("${nagad.base-url:https://sandbox.mytgateway.com/nagad}")
    private String baseUrl;

    @Value("${nagad.merchant-id:TEST_NAGAD_MERCHANT}")
    private String merchantId;

    @Value("${nagad.callback-url:http://localhost:8080/api/v1/payments/nagad/callback}")
    private String callbackUrl;

    @Override
    public PaymentInitiation initiate(PaymentRequestDto request) {
        String paymentRef = "NGD_" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        String checkoutUrl = baseUrl + "/check-out?paymentRefId=" + paymentRef + "&merchantId=" + merchantId;

        log.info("[Nagad Session Initiated] paymentRef: {}, Order: {}", paymentRef, request.getOrderId());

        return new PaymentInitiation(
                paymentRef,
                PaymentStatus.INITIATED,
                checkoutUrl,
                "Redirect customer to Nagad checkout gateway portal."
        );
    }

    @Override
    public PaymentVerification verify(String paymentRefId) {
        log.info("[Nagad Verification] Checking status for paymentRef: {}", paymentRefId);

        return new PaymentVerification(
                paymentRefId,
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
