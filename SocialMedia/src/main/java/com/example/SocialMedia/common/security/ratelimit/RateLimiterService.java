package com.example.SocialMedia.common.security.ratelimit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RateLimiterService {

    @Value("${app.security.rate-limit.enabled:true}")
    private boolean rateLimitEnabled;

    @Value("${app.security.rate-limit.default-rpm:60}")
    private int defaultRpm;

    @Value("${app.security.rate-limit.auth-rpm:15}")
    private int authRpm;

    private static class WindowCounter {
        long windowStartSeconds;
        AtomicInteger count = new AtomicInteger(0);

        WindowCounter(long windowStartSeconds) {
            this.windowStartSeconds = windowStartSeconds;
        }
    }

    private final Map<String, WindowCounter> requestCounts = new ConcurrentHashMap<>();

    public boolean isAllowed(String clientIp, String uri) {
        if (!rateLimitEnabled) {
            return true;
        }

        int maxAllowed = uri.contains("/auth/") ? authRpm : defaultRpm;
        long currentSecond = System.currentTimeMillis() / 1000;
        long currentWindow = currentSecond / 60; // 1-minute window bucket

        String key = clientIp + ":" + (uri.contains("/auth/") ? "auth" : "api");

        WindowCounter counter = requestCounts.compute(key, (k, existing) -> {
            if (existing == null || existing.windowStartSeconds != currentWindow) {
                WindowCounter fresh = new WindowCounter(currentWindow);
                fresh.count.set(1);
                return fresh;
            } else {
                existing.count.incrementAndGet();
                return existing;
            }
        });

        return counter.count.get() <= maxAllowed;
    }

    public int getRemainingRequests(String clientIp, String uri) {
        int maxAllowed = uri.contains("/auth/") ? authRpm : defaultRpm;
        long currentWindow = (System.currentTimeMillis() / 1000) / 60;
        String key = clientIp + ":" + (uri.contains("/auth/") ? "auth" : "api");

        WindowCounter counter = requestCounts.get(key);
        if (counter == null || counter.windowStartSeconds != currentWindow) {
            return maxAllowed;
        }
        int remaining = maxAllowed - counter.count.get();
        return Math.max(0, remaining);
    }

    public int getLimit(String uri) {
        return uri.contains("/auth/") ? authRpm : defaultRpm;
    }
}
