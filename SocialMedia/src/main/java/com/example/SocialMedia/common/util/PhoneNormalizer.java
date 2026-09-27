package com.example.SocialMedia.common.util;

import com.example.SocialMedia.common.exception.BadRequestException;
import java.util.regex.Pattern;

public final class PhoneNormalizer {

    private static final Pattern BD_PHONE_PATTERN = Pattern.compile("^(?:\\+?88)?01[3-9]\\d{8}$");

    private PhoneNormalizer() {
    }

    /**
     * Validates and normalizes any Bangladeshi phone input into local standard "01XXXXXXXXX" (11 digits).
     * Examples of valid inputs:
     * "+8801712345678" -> "01712345678"
     * "8801712345678"  -> "01712345678"
     * "01712345678"    -> "01712345678"
     * "01712-345678"   -> "01712345678"
     */
    public static String normalize(String rawPhone) {
        if (rawPhone == null || rawPhone.isBlank()) {
            throw new BadRequestException("Phone number cannot be empty", "INVALID_PHONE");
        }

        // Remove spaces, hyphens, parentheses
        String cleaned = rawPhone.replaceAll("[\\s\\-\\(\\)]", "");

        if (!BD_PHONE_PATTERN.matcher(cleaned).matches()) {
            throw new BadRequestException(
                    "Invalid Bangladeshi phone number. Must be 11 digits starting with 01[3-9] (e.g. 01712345678)",
                    "INVALID_PHONE"
            );
        }

        if (cleaned.startsWith("+88")) {
            return cleaned.substring(3);
        } else if (cleaned.startsWith("88")) {
            return cleaned.substring(2);
        }
        return cleaned;
    }

    /**
     * Formats normalized 11-digit phone to international E.164: +8801XXXXXXXXX
     */
    public static String toE164(String normalizedPhone) {
        if (normalizedPhone == null) {
            return null;
        }
        String local = normalize(normalizedPhone);
        return "+88" + local;
    }
}
