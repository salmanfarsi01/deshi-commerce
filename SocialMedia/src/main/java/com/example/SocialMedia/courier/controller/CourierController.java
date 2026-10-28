package com.example.SocialMedia.courier.controller;

import com.example.SocialMedia.common.response.ApiResponse;
import com.example.SocialMedia.courier.dto.ConsignmentBookingRequest;
import com.example.SocialMedia.courier.dto.ConsignmentBookingResponse;
import com.example.SocialMedia.courier.service.CourierBookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class CourierController {

    private final CourierBookingService courierBookingService;

    public CourierController(CourierBookingService courierBookingService) {
        this.courierBookingService = courierBookingService;
    }

    /**
     * Admin direct consignment booking endpoint for Steadfast / Pathao.
     */
    @PostMapping("/admin/courier/book-consignment")
    public ResponseEntity<ApiResponse<ConsignmentBookingResponse>> bookConsignment(
            @Valid @RequestBody ConsignmentBookingRequest request) {
        ConsignmentBookingResponse response = courierBookingService.bookConsignment(request);
        return ResponseEntity.ok(ApiResponse.success("Consignment booked successfully", response));
    }

    /**
     * Public webhook for Steadfast delivery tracking updates.
     */
    @PostMapping("/courier/webhook/steadfast")
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleSteadfastWebhook(
            @RequestBody Map<String, Object> payload) {
        boolean handled = courierBookingService.handleSteadfastWebhook(payload);
        return ResponseEntity.ok(ApiResponse.success(
                handled ? "Webhook processed successfully" : "Webhook acknowledged (no order match)",
                Map.of("status", handled ? "PROCESSED" : "IGNORED")
        ));
    }

    /**
     * Public webhook for Pathao delivery tracking updates.
     */
    @PostMapping("/courier/webhook/pathao")
    public ResponseEntity<ApiResponse<Map<String, Object>>> handlePathaoWebhook(
            @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(ApiResponse.success(
                "Pathao webhook received",
                Map.of("status", "ACKNOWLEDGED")
        ));
    }
}
