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
public class CashOnDeliveryGateway implements PaymentGateway {

    @Override
    public PaymentInitiation initiate(PaymentRequestDto request) {
        String txnId = "COD_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return new PaymentInitiation(
                txnId,
                PaymentStatus.PENDING,
                null,
                "Pay cash in BDT upon delivery of your items to the delivery agent."
        );
    }

    @Override
    public PaymentVerification verify(String transactionId) {
        // COD is collected upon delivery
        return new PaymentVerification(
                transactionId,
                PaymentStatus.SUCCESS,
                true,
                "COD_COLLECTED",
                "Cash on delivery received successfully"
        );
    }

    @Override
    public PaymentRefund refund(String transactionId) {
        return new PaymentRefund("REF_" + UUID.randomUUID().toString().substring(0, 8), transactionId, null, true, "COD refunded via bank/manual channel");
    }

    @Override
    public PaymentMethod getSupportedMethod() {
        return PaymentMethod.COD;
    }
}
