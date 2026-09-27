package com.example.SocialMedia.user.controller;

import com.example.SocialMedia.common.response.ApiResponse;
import com.example.SocialMedia.user.dto.ChangePasswordRequest;
import com.example.SocialMedia.user.dto.UpdateProfileRequest;
import com.example.SocialMedia.user.dto.UserProfileResponse;
import com.example.SocialMedia.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserProfileResponse response = userService.getProfile(authHeader);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
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
