package com.example.SocialMedia.order.controller;

import com.example.SocialMedia.common.response.ApiResponse;
import com.example.SocialMedia.order.dto.OrderResponse;
import com.example.SocialMedia.order.dto.OrderStatusUpdateRequest;
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
            @RequestParam(required = false) OrderStatus status) {
        List<OrderResponse> orders = orderService.getAllOrdersAdmin(status);
        return ResponseEntity.ok(ApiResponse.success("Admin orders retrieved successfully", orders));
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
}
