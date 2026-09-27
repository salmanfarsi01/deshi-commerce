package com.example.SocialMedia.common.security.bruteforce;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    @Value("${app.security.brute-force.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.security.brute-force.lockout-minutes:15}")
    private int lockoutMinutes;

    private static class AttemptRecord {
        int attempts;
        long lastAttemptTimestamp;

        AttemptRecord(int attempts, long lastAttemptTimestamp) {
            this.attempts = attempts;
            this.lastAttemptTimestamp = lastAttemptTimestamp;
        }
    }

    private final Map<String, AttemptRecord> attemptsCache = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        AttemptRecord record = attemptsCache.get(key.toLowerCase().trim());
        if (record == null) {
            return false;
        }

        long lockoutDurationMs = lockoutMinutes * 60L * 1000L;
        if (System.currentTimeMillis() - record.lastAttemptTimestamp > lockoutDurationMs) {
            // Lockout period has elapsed, unblock
            attemptsCache.remove(key.toLowerCase().trim());
            return false;
        }

        return record.attempts >= maxAttempts;
    }

    public void loginFailed(String key) {
        String cleanKey = key.toLowerCase().trim();
        attemptsCache.compute(cleanKey, (k, existing) -> {
            if (existing == null) {
                return new AttemptRecord(1, System.currentTimeMillis());
            } else {
                existing.attempts++;
                existing.lastAttemptTimestamp = System.currentTimeMillis();
                return existing;
            }
        });
    }

    public void loginSucceeded(String key) {
        attemptsCache.remove(key.toLowerCase().trim());
    }

    public int getRemainingAttempts(String key) {
        AttemptRecord record = attemptsCache.get(key.toLowerCase().trim());
        if (record == null) {
            return maxAttempts;
        }
        return Math.max(0, maxAttempts - record.attempts);
    }
}
