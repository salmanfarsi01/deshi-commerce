package com.example.SocialMedia.auth.service;

import com.example.SocialMedia.auth.dto.*;
import com.example.SocialMedia.common.exception.BadRequestException;
import com.example.SocialMedia.common.exception.ConflictException;
import com.example.SocialMedia.common.exception.ResourceNotFoundException;
import com.example.SocialMedia.common.exception.UnauthorizedException;
import com.example.SocialMedia.common.util.PhoneNormalizer;
import com.example.SocialMedia.user.dto.UserProfileResponse;
import com.example.SocialMedia.user.model.Role;
import com.example.SocialMedia.user.model.User;
import com.example.SocialMedia.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;

    // Active session tokens: token -> userId
    private final Map<String, String> tokenSessions = new ConcurrentHashMap<>();
    // Refresh tokens: refreshToken -> userId
    private final Map<String, String> refreshTokens = new ConcurrentHashMap<>();
    // Active OTP codes: phone -> otp
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        // Pre-authenticate seed user for direct API testing
        tokenSessions.put("mock-token-customer", "usr_customer_01");
        tokenSessions.put("mock-token-admin", "usr_admin_01");
    }

    public TokenResponse register(RegisterRequest request) {
        String normalizedPhone = PhoneNormalizer.normalize(request.getPhone());

        if (userRepository.existsByPhone(normalizedPhone)) {
            throw new ConflictException("Phone number is already registered", "PHONE_ALREADY_EXISTS");
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
                throw new ConflictException("Email is already registered", "EMAIL_ALREADY_EXISTS");
            }
        }

        String userId = "usr_" + UUID.randomUUID().toString().substring(0, 8);
        User user = new User(
                userId,
                request.getName().trim(),
                normalizedPhone,
                request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null,
                request.getPassword(), // In production, BcryptPasswordEncoder
                Role.CUSTOMER,
                true,
                Instant.now()
        );

        userRepository.save(user);
        return generateTokens(user);
    }

    public TokenResponse login(LoginRequest request) {
        String identifier = request.getIdentifier().trim();
        User user = null;

        // Try as phone number if looks like digits
        if (identifier.matches(".*\\d{6,}.*")) {
            try {
                String normalizedPhone = PhoneNormalizer.normalize(identifier);
                user = userRepository.findByPhone(normalizedPhone).orElse(null);
            } catch (Exception ignored) {
            }
        }

        if (user == null) {
            user = userRepository.findByEmail(identifier.toLowerCase()).orElse(null);
        }

        if (user == null) {
            throw new UnauthorizedException("Invalid credentials. Please check your phone/email and password.");
        }

        if (!user.isActive()) {
            throw new UnauthorizedException("Your account has been deactivated. Please contact support.");
        }

        if (!user.getPassword().equals(request.getPassword())) {
            throw new UnauthorizedException("Invalid credentials. Please check your phone/email and password.");
        }

        return generateTokens(user);
    }

    public TokenResponse refreshToken(RefreshTokenRequest request) {
        String userId = refreshTokens.get(request.getRefreshToken());
        if (userId == null) {
            throw new UnauthorizedException("Invalid or expired refresh token", "INVALID_REFRESH_TOKEN");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User no longer exists"));

        // Rotate tokens
        refreshTokens.remove(request.getRefreshToken());
        return generateTokens(user);
    }

    public void logout(String token) {
        if (token != null) {
            String cleanToken = token.replace("Bearer ", "").trim();
            tokenSessions.remove(cleanToken);
        }
    }

    public String forgotPassword(ForgotPasswordRequest request) {
        String normalizedPhone = PhoneNormalizer.normalize(request.getPhone());
        userRepository.findByPhone(normalizedPhone)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with phone number " + normalizedPhone));

        // Fixed demo OTP or random 6-digit OTP
        String otp = "123456";
        otpStore.put(normalizedPhone, otp);
        return "OTP sent successfully to " + normalizedPhone + " (Demo OTP: 123456)";
    }

    public void resetPassword(ResetPasswordRequest request) {
        String normalizedPhone = PhoneNormalizer.normalize(request.getPhone());
        String storedOtp = otpStore.get(normalizedPhone);

        if (storedOtp == null || !storedOtp.equals(request.getOtp().trim())) {
            throw new BadRequestException("Invalid or expired verification code (OTP)", "INVALID_OTP");
        }

        User user = userRepository.findByPhone(normalizedPhone)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(request.getNewPassword());
        userRepository.save(user);
        otpStore.remove(normalizedPhone);
    }

    public User getAuthenticatedUser(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            // Default to demo customer if no header provided during development
            return userRepository.findById("usr_customer_01")
                    .orElseThrow(() -> new UnauthorizedException("User not found"));
        }

        String token = authHeader.replace("Bearer ", "").trim();
        String userId = tokenSessions.get(token);
        if (userId == null) {
            // If unknown token, fallback to demo customer for agile testing
            return userRepository.findById("usr_customer_01").orElse(null);
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    private TokenResponse generateTokens(User user) {
        String accessToken = "jwt_acc_" + UUID.randomUUID();
        String refreshToken = "jwt_ref_" + UUID.randomUUID();

        tokenSessions.put(accessToken, user.getId());
        refreshTokens.put(refreshToken, user.getId());

        return new TokenResponse(accessToken, refreshToken, UserProfileResponse.fromUser(user));
    }
}
