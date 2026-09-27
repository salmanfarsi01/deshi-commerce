package com.example.SocialMedia.user.service;

import com.example.SocialMedia.auth.service.AuthService;
import com.example.SocialMedia.common.exception.BadRequestException;
import com.example.SocialMedia.common.exception.ConflictException;
import com.example.SocialMedia.user.dto.ChangePasswordRequest;
import com.example.SocialMedia.user.dto.UpdateProfileRequest;
import com.example.SocialMedia.user.dto.UserProfileResponse;
import com.example.SocialMedia.user.model.User;
import com.example.SocialMedia.user.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;

    public UserService(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    public UserProfileResponse getProfile(String authHeader) {
        User user = authService.getAuthenticatedUser(authHeader);
        return UserProfileResponse.fromUser(user);
    }

    public UserProfileResponse updateProfile(String authHeader, UpdateProfileRequest request) {
        User user = authService.getAuthenticatedUser(authHeader);

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new ConflictException("Email is already registered by another account", "EMAIL_ALREADY_EXISTS");
            }
            user.setEmail(newEmail);
        }

        user.setName(request.getName().trim());
        userRepository.save(user);
        return UserProfileResponse.fromUser(user);
    }

    public void changePassword(String authHeader, ChangePasswordRequest request) {
        User user = authService.getAuthenticatedUser(authHeader);

        if (!user.getPassword().equals(request.getCurrentPassword())) {
            throw new BadRequestException("Current password does not match", "INCORRECT_PASSWORD");
        }

        user.setPassword(request.getNewPassword());
        userRepository.save(user);
    }
}
