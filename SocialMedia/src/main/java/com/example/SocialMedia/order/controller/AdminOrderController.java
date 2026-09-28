package com.example.SocialMedia.order.controller;

import com.example.SocialMedia.admin.dto.CustomerOrderTrackingSummary;
import com.example.SocialMedia.common.response.ApiResponse;
import com.example.SocialMedia.order.dto.OrderResponse;
import com.example.SocialMedia.order.dto.OrderStatusUpdateRequest;
import com.example.SocialMedia.order.dto.OrderTrackingUpdateRequest;
import com.example.SocialMedia.order.model.OrderStatus;
import com.example.SocialMedia.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String search) {
        List<OrderResponse> orders = orderService.getAllOrdersAdmin(status, userId, search);
        return ResponseEntity.ok(ApiResponse.success("Admin orders retrieved successfully", orders));
    }

    @GetMapping("/customer/{userId}")
    public ResponseEntity<ApiResponse<CustomerOrderTrackingSummary>> getCustomerOrdersSummary(
            @PathVariable String userId) {
        CustomerOrderTrackingSummary summary = orderService.getCustomerOrderSummaryAdmin(userId);
        return ResponseEntity.ok(ApiResponse.success("Customer order tracking summary retrieved successfully", summary));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String orderId) {
        OrderResponse order = orderService.getOrderById(authHeader, orderId);
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable String orderId,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        OrderResponse order = orderService.updateOrderStatusAdmin(orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", order));
    }

    @PatchMapping("/{orderId}/tracking")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderTracking(
            @PathVariable String orderId,
            @Valid @RequestBody OrderTrackingUpdateRequest request) {
        OrderResponse order = orderService.updateOrderTrackingAdmin(orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Order courier tracking updated successfully", order));
    }
}
