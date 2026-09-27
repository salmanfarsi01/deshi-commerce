package com.example.SocialMedia.admin.controller;

import com.example.SocialMedia.admin.dto.DashboardSummaryResponse;
import com.example.SocialMedia.admin.service.AdminDashboardService;
import com.example.SocialMedia.common.response.ApiResponse;
import com.example.SocialMedia.user.dto.UserProfileResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary() {
        DashboardSummaryResponse summary = dashboardService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard summary retrieved", summary));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> getAllUsers() {
        List<UserProfileResponse> users = dashboardService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("User list retrieved", users));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<UserProfileResponse>> setUserStatus(
            @PathVariable String userId,
            @RequestParam boolean active) {
        UserProfileResponse updatedUser = dashboardService.setUserStatus(userId, active);
        return ResponseEntity.ok(ApiResponse.success("User account status updated", updatedUser));
    }
}
