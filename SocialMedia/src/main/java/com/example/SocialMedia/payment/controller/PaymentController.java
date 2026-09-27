package com.example.SocialMedia.payment.controller;

import com.example.SocialMedia.common.response.ApiResponse;
import com.example.SocialMedia.payment.dto.PaymentMethodDto;
import com.example.SocialMedia.payment.dto.PaymentResponse;
import com.example.SocialMedia.payment.dto.PaymentVerification;
import com.example.SocialMedia.payment.dto.PaymentVerifyRequest;
import com.example.SocialMedia.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/methods")
    public ResponseEntity<ApiResponse<List<PaymentMethodDto>>> getAvailableMethods() {
        List<PaymentMethodDto> methods = paymentService.getAvailableMethods();
        return ResponseEntity.ok(ApiResponse.success("Available payment methods retrieved", methods));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<PaymentVerification>> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request) {
        PaymentVerification verification = paymentService.verifyPayment(request.getTransactionId());
        return ResponseEntity.ok(ApiResponse.success("Payment verification result", verification));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByOrderId(@PathVariable String orderId) {
        PaymentResponse response = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success("Payment retrieved successfully", response));
    }
}
