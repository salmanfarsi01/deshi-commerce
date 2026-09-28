package com.example.SocialMedia.common.security.ratelimit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimiterService rateLimiterService;

    public RateLimitingFilter(RateLimiterService rateLimiterService) {
        this.rateLimiterService = rateLimiterService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String clientIp = getClientIp(request);
        String uri = request.getRequestURI();

        // Bypass Swagger UI & OpenAPI documentation and payment webhooks from rate limiting
        if (uri.startsWith("/swagger-ui") || uri.startsWith("/v3/api-docs") || uri.startsWith("/webjars")
                || uri.startsWith("/api/v1/payments/sslcommerz")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!rateLimiterService.isAllowed(clientIp, uri)) {
            response.setStatus(429); // 429 Too Many Requests
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", "60");
            response.setHeader("X-RateLimit-Limit", String.valueOf(rateLimiterService.getLimit(uri)));
            response.setHeader("X-RateLimit-Remaining", "0");

            String json = String.format(
                    "{\"success\":false,\"message\":\"Too many requests. Please slow down and try again in a few moments.\",\"code\":\"RATE_LIMIT_EXCEEDED\",\"timestamp\":\"%s\"}",
                    Instant.now().toString()
            );
            response.getWriter().write(json);
            return;
        }

        response.setHeader("X-RateLimit-Limit", String.valueOf(rateLimiterService.getLimit(uri)));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(rateLimiterService.getRemainingRequests(clientIp, uri)));

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) {
            return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
        }
        return xfHeader.split(",")[0].trim();
    }
}
