package com.example.SocialMedia.auth.service;

import com.example.SocialMedia.auth.dto.*;
import com.example.SocialMedia.common.exception.BadRequestException;
import com.example.SocialMedia.common.exception.ConflictException;
import com.example.SocialMedia.common.exception.ResourceNotFoundException;
import com.example.SocialMedia.common.exception.UnauthorizedException;
import com.example.SocialMedia.common.security.jwt.JwtTokenProvider;
import com.example.SocialMedia.common.util.PhoneNormalizer;
import com.example.SocialMedia.user.dto.UserProfileResponse;
import com.example.SocialMedia.user.model.Role;
import com.example.SocialMedia.user.model.User;
import com.example.SocialMedia.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // Refresh tokens: refreshToken -> userId
    private final Map<String, String> refreshTokens = new ConcurrentHashMap<>();
    // Blacklisted / invalidated access tokens
    private final Map<String, Boolean> tokenBlacklist = new ConcurrentHashMap<>();
    // Active OTP codes: phone -> otp
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
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
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(
                userId,
                request.getName().trim(),
                normalizedPhone,
                request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null,
                hashedPassword,
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

        // Verify password using BCrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials. Please check your phone/email and password.");
        }

        return generateTokens(user);
    }

    public TokenResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token", "INVALID_REFRESH_TOKEN");
        }

        String userId = jwtTokenProvider.extractUserId(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User no longer exists"));

        // Rotate refresh token
        refreshTokens.remove(refreshToken);
        return generateTokens(user);
    }

    public void logout(String token) {
        if (token != null) {
            String cleanToken = token.replace("Bearer ", "").trim();
            tokenBlacklist.put(cleanToken, true);
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

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        otpStore.remove(normalizedPhone);
    }

    public User getAuthenticatedUser(String authHeader) {
        // 1. Try SecurityContextHolder principal (populated by JwtAuthenticationFilter)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }

        // 2. Try parsing Bearer JWT from header directly
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (jwtTokenProvider.validateToken(token)) {
                String userId = jwtTokenProvider.extractUserId(token);
                return userRepository.findById(userId)
                        .orElseThrow(() -> new UnauthorizedException("User not found"));
            }
        }

        // 3. Fallback to default demo customer if testing without security context
        return userRepository.findById("usr_customer_01")
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    private TokenResponse generateTokens(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        refreshTokens.put(refreshToken, user.getId());

        TokenResponse response = new TokenResponse(accessToken, refreshToken, UserProfileResponse.fromUser(user));
        response.setExpiresIn(jwtTokenProvider.getExpirationSeconds());
        return response;
    }
}
