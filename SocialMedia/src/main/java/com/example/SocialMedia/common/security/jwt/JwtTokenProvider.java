package com.example.SocialMedia.common.security.jwt;

import com.example.SocialMedia.user.model.Role;
import com.example.SocialMedia.user.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    // Default 256-bit secure secret key for HS256 algorithm
    @Value("${app.jwt.secret:DeshiCommerceSecretKeyForJwtSigningMustBeAtLeast256BitsLongForHMACSHA256}")
    private String jwtSecret;

    // 24 hours access token validity (in milliseconds)
    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    // 7 days refresh token validity (in milliseconds)
    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    private static final String HEADER_JSON = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
    private static final String HEADER_BASE64 = Base64.getUrlEncoder().withoutPadding()
            .encodeToString(HEADER_JSON.getBytes(StandardCharsets.UTF_8));

    public String generateAccessToken(User user) {
        return buildToken(user.getId(), user.getRole().name(), user.getPhone(), jwtExpirationMs);
    }

    public String generateRefreshToken(User user) {
        return buildToken(user.getId(), user.getRole().name(), user.getPhone(), refreshExpirationMs);
    }

    private String buildToken(String userId, String role, String phone, long durationMs) {
        long now = Instant.now().getEpochSecond();
        long exp = now + (durationMs / 1000);

        String payloadJson = String.format(
                "{\"sub\":\"%s\",\"role\":\"%s\",\"phone\":\"%s\",\"iat\":%d,\"exp\":%d}",
                escapeJson(userId),
                escapeJson(role),
                escapeJson(phone != null ? phone : ""),
                now,
                exp
        );

        String payloadBase64 = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));

        String signature = sign(HEADER_BASE64 + "." + payloadBase64, jwtSecret);
        return HEADER_BASE64 + "." + payloadBase64 + "." + signature;
    }

    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return false;
        }

        String headerAndPayload = parts[0] + "." + parts[1];
        String signature = parts[2];
        String expectedSignature = sign(headerAndPayload, jwtSecret);

        if (!MessageDigest.isEqual(signature.getBytes(StandardCharsets.UTF_8), expectedSignature.getBytes(StandardCharsets.UTF_8))) {
            log.warn("Invalid JWT signature");
            return false;
        }

        long exp = extractExpiration(parts[1]);
        if (exp > 0 && exp < Instant.now().getEpochSecond()) {
            log.warn("JWT token has expired");
            return false;
        }

        return true;
    }

    public String extractUserId(String token) {
        String payloadJson = decodePayload(token);
        return extractJsonString(payloadJson, "sub");
    }

    public Role extractRole(String token) {
        String payloadJson = decodePayload(token);
        String roleStr = extractJsonString(payloadJson, "role");
        try {
            return Role.valueOf(roleStr);
        } catch (Exception e) {
            return Role.CUSTOMER;
        }
    }

    public String extractPhone(String token) {
        String payloadJson = decodePayload(token);
        return extractJsonString(payloadJson, "phone");
    }

    public long getExpirationSeconds() {
        return jwtExpirationMs / 1000;
    }

    private String decodePayload(String token) {
        try {
            String[] parts = token.split("\\.");
            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            return new String(decoded, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to decode token payload", e);
            return "{}";
        }
    }

    private long extractExpiration(String payloadBase64) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(payloadBase64);
            String json = new String(decoded, StandardCharsets.UTF_8);
            Matcher matcher = Pattern.compile("\"exp\":\\s*(\\d+)").matcher(json);
            if (matcher.find()) {
                return Long.parseLong(matcher.group(1));
            }
        } catch (Exception ignored) {
        }
        return 0;
    }

    private String extractJsonString(String json, String field) {
        Matcher matcher = Pattern.compile("\"" + field + "\":\\s*\"([^\"]*)\"").matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    private String sign(String data, String secret) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKey);
            byte[] signedBytes = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error signing JWT", e);
        }
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
