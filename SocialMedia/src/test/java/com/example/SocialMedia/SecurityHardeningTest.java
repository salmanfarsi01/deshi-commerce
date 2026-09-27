package com.example.SocialMedia;

import com.example.SocialMedia.auth.dto.LoginRequest;
import com.example.SocialMedia.auth.dto.RefreshTokenRequest;
import com.example.SocialMedia.auth.dto.RegisterRequest;
import com.example.SocialMedia.auth.dto.TokenResponse;
import com.example.SocialMedia.auth.service.AuthService;
import com.example.SocialMedia.common.exception.BadRequestException;
import com.example.SocialMedia.common.exception.UnauthorizedException;
import com.example.SocialMedia.common.util.InputSanitizer;
import com.example.SocialMedia.common.security.tenant.TenantContext;
import com.example.SocialMedia.product.model.Product;
import com.example.SocialMedia.product.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class SecurityHardeningTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private ProductRepository productRepository;

    @Test
    @DisplayName("Input Sanitizer should neutralize XSS tags and harmful payloads")
    void testInputSanitization() {
        String unsafe = "<script>alert('pwned')</script>John Doe <img src=x onerror=alert(1)>";
        String clean = InputSanitizer.sanitize(unsafe);
        assertFalse(clean.contains("<script>"));
        assertFalse(clean.contains("<img"));
        assertTrue(clean.contains("John Doe"));
    }

    @Test
    @DisplayName("Tenant Isolation scopes store queries to current Tenant ID")
    void testTenantIsolation() {
        // Save product under tenant "tenant-beta"
        Product betaProduct = new Product(
                "prd_beta_test",
                "Beta Exclusive Item",
                "beta-exclusive-item",
                "Item only for Beta tenant",
                BigDecimal.valueOf(999),
                null,
                "BDT",
                10,
                "cat_01",
                new ArrayList<>(),
                true,
                5.0,
                Instant.now()
        );
        betaProduct.setTenantId("tenant-beta");
        productRepository.save(betaProduct);

        // Switch to tenant-alpha
        TenantContext.setTenantId("tenant-alpha");
        List<Product> alphaProducts = productRepository.findAll();
        boolean hasBeta = alphaProducts.stream().anyMatch(p -> "tenant-beta".equalsIgnoreCase(p.getTenantId()));
        assertFalse(hasBeta, "Tenant alpha should NOT see products exclusive to tenant-beta");

        // Switch to tenant-beta
        TenantContext.setTenantId("tenant-beta");
        List<Product> betaProducts = productRepository.findAll();
        boolean foundBeta = betaProducts.stream().anyMatch(p -> "tenant-beta".equalsIgnoreCase(p.getTenantId()));
        assertTrue(foundBeta, "Tenant beta SHOULD see its own exclusive products");

        TenantContext.clear();
    }

    @Test
    @DisplayName("Brute-Force Protection locks out rapid failed login attempts")
    void testBruteForceProtection() {
        String bruteForceEmail = "hacker_" + System.currentTimeMillis() + "@test.com";

        // Register user
        RegisterRequest registerReq = new RegisterRequest("Target User", "01812345678", bruteForceEmail, "Secr3t!P@ss");
        authService.register(registerReq);

        // Trigger 5 consecutive failed logins
        for (int i = 0; i < 5; i++) {
            assertThrows(UnauthorizedException.class, () ->
                    authService.login(new LoginRequest(bruteForceEmail, "WrongPassword!"))
            );
        }

        // 6th attempt should result in account lockout BadRequestException
        BadRequestException lockoutEx = assertThrows(BadRequestException.class, () ->
                authService.login(new LoginRequest(bruteForceEmail, "WrongPassword!"))
        );
        assertTrue(lockoutEx.getMessage().toLowerCase().contains("locked"));
    }

    @Test
    @DisplayName("Refresh Token Rotation prevents reuse of invalidated refresh tokens")
    void testRefreshTokenRotation() {
        String testEmail = "rotate_" + System.currentTimeMillis() + "@test.com";
        TokenResponse tokens = authService.register(new RegisterRequest("Rotator", "01712345678", testEmail, "Secr3t!P@ss"));

        String originalRefreshToken = tokens.getRefreshToken();

        // 1st rotation - valid
        TokenResponse rotated = authService.refreshToken(new RefreshTokenRequest(originalRefreshToken));
        assertNotNull(rotated.getRefreshToken());
        assertNotEquals(originalRefreshToken, rotated.getRefreshToken(), "New refresh token must be issued");

        // Replaying original refresh token must be rejected (reuse attack detection)
        assertThrows(UnauthorizedException.class, () ->
                authService.refreshToken(new RefreshTokenRequest(originalRefreshToken))
        );
    }
}
