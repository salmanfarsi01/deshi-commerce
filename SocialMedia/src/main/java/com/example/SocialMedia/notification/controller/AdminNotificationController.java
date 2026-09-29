package com.example.SocialMedia.notification.controller;

import com.example.SocialMedia.common.response.ApiResponse;
import com.example.SocialMedia.notification.model.NotificationLog;
import com.example.SocialMedia.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/notifications")
@Tag(name = "Admin Notifications", description = "Audit and inspect sent SMS and Email notification logs")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    private final NotificationService notificationService;

    public AdminNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get all notification audit logs (Admin only)")
    public ResponseEntity<ApiResponse<List<NotificationLog>>> getAllNotifications() {
        List<NotificationLog> logs = notificationService.getAllNotifications();
        return ResponseEntity.ok(ApiResponse.success("Notification logs retrieved successfully", logs));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get notification logs for a specific order (Admin only)")
    public ResponseEntity<ApiResponse<List<NotificationLog>>> getOrderNotifications(@PathVariable String orderId) {
        List<NotificationLog> logs = notificationService.getOrderNotifications(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order notification logs retrieved successfully", logs));
    }
}
