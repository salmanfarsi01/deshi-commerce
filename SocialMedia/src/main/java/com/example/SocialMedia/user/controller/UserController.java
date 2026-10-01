package com.example.SocialMedia.user.controller;

import com.example.SocialMedia.auth.service.AuthService;
import com.example.SocialMedia.common.response.ApiResponse;
import com.example.SocialMedia.notification.model.NotificationLog;
import com.example.SocialMedia.notification.service.NotificationService;
import com.example.SocialMedia.user.dto.ChangePasswordRequest;
import com.example.SocialMedia.user.dto.UpdateProfileRequest;
import com.example.SocialMedia.user.dto.UserProfileResponse;
import com.example.SocialMedia.user.model.User;
import com.example.SocialMedia.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;
    private final NotificationService notificationService;

    public UserController(UserService userService,
                          AuthService authService,
                          NotificationService notificationService) {
        this.userService = userService;
        this.authService = authService;
        this.notificationService = notificationService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserProfileResponse response = userService.getProfile(authHeader);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    @GetMapping("/me/notifications")
    public ResponseEntity<ApiResponse<List<NotificationLog>>> getMyNotifications(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = authService.getAuthenticatedUser(authHeader);
        List<NotificationLog> list = notificationService.getCustomerNotifications(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", list));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileResponse response = userService.updateProfile(authHeader, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(authHeader, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}
