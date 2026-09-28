package com.example.SocialMedia.payment.controller;

import com.example.SocialMedia.common.response.ApiResponse;
import com.example.SocialMedia.payment.dto.SslCommerzCallbackResponse;
import com.example.SocialMedia.payment.dto.SslCommerzInitResponse;
import com.example.SocialMedia.payment.service.SslCommerzService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments/sslcommerz")
public class SslCommerzPaymentController {

    private final SslCommerzService sslCommerzService;

    public SslCommerzPaymentController(SslCommerzService sslCommerzService) {
        this.sslCommerzService = sslCommerzService;
    }

    @PostMapping("/init/{orderId}")
    public ResponseEntity<ApiResponse<SslCommerzInitResponse>> initiateSslCommerzPayment(
            @PathVariable String orderId) {
        SslCommerzInitResponse response = sslCommerzService.initiatePayment(orderId);
        return ResponseEntity.ok(ApiResponse.success("SSLCommerz payment session created", response));
    }

    @PostMapping("/success")
    public ResponseEntity<ApiResponse<SslCommerzCallbackResponse>> handleSuccess(
            @RequestParam Map<String, String> payload) {
        SslCommerzCallbackResponse response = sslCommerzService.handleSuccess(payload);
        return ResponseEntity.ok(ApiResponse.success("SSLCommerz payment successful", response));
    }

    @PostMapping("/fail")
    public ResponseEntity<ApiResponse<SslCommerzCallbackResponse>> handleFail(
            @RequestParam Map<String, String> payload) {
        SslCommerzCallbackResponse response = sslCommerzService.handleFail(payload);
        return ResponseEntity.ok(ApiResponse.success("SSLCommerz payment failed", response));
    }

    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse<SslCommerzCallbackResponse>> handleCancel(
            @RequestParam Map<String, String> payload) {
        SslCommerzCallbackResponse response = sslCommerzService.handleCancel(payload);
        return ResponseEntity.ok(ApiResponse.success("SSLCommerz payment cancelled", response));
    }

    @PostMapping("/ipn")
    public ResponseEntity<ApiResponse<SslCommerzCallbackResponse>> handleIpn(
            @RequestParam Map<String, String> payload) {
        SslCommerzCallbackResponse response = sslCommerzService.handleSuccess(payload);
        return ResponseEntity.ok(ApiResponse.success("SSLCommerz IPN processed", response));
    }

    @PostMapping("/simulate-success/{orderId}")
    public ResponseEntity<ApiResponse<SslCommerzCallbackResponse>> simulateSuccess(
            @PathVariable String orderId) {
        SslCommerzCallbackResponse response = sslCommerzService.simulateSuccess(orderId);
        return ResponseEntity.ok(ApiResponse.success("SSLCommerz payment successfully simulated", response));
    }
}
