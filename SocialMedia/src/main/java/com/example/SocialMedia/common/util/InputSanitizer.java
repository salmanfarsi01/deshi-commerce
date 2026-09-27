package com.example.SocialMedia.common.util;

import java.util.regex.Pattern;

public final class InputSanitizer {

    private static final Pattern SCRIPT_PATTERN = Pattern.compile("(?i)<script.*?>.*?</script.*?>");
    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile("(?i)(--|;|/\\*|\\*/|xp_)");

    private InputSanitizer() {
    }

    /**
     * Strips dangerous HTML tags, script injection patterns, and trims input safely.
     */
    public static String sanitize(String input) {
        if (input == null) {
            return null;
        }

        String cleaned = SCRIPT_PATTERN.matcher(input).replaceAll("");
        cleaned = HTML_TAG_PATTERN.matcher(cleaned).replaceAll("");
        cleaned = SQL_INJECTION_PATTERN.matcher(cleaned).replaceAll("");
        return cleaned.trim();
    }
}
