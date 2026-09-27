package com.example.SocialMedia.order.controller;

import com.example.SocialMedia.common.response.ApiResponse;
import com.example.SocialMedia.order.dto.CancelOrderRequest;
import com.example.SocialMedia.order.dto.CreateOrderRequest;
import com.example.SocialMedia.order.dto.OrderResponse;
import com.example.SocialMedia.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(authHeader, request);
        return new ResponseEntity<>(ApiResponse.success("Order placed successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrders(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        List<OrderResponse> orders = orderService.getUserOrders(authHeader);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String orderId) {
        OrderResponse order = orderService.getOrderById(authHeader, orderId);
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String orderId,
            @RequestBody(required = false) CancelOrderRequest request) {
        OrderResponse order = orderService.cancelOrder(authHeader, orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }
}
