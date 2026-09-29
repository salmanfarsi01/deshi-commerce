package com.example.SocialMedia.notification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Bangladesh SMS Gateway Client.
 * Supports sandbox simulation and pluggable production SMS aggregators (e.g. Greenweb, Reve, SSL Wireless).
 */
@Component
public class SmsGatewayClient {

    private static final Logger log = LoggerFactory.getLogger(SmsGatewayClient.class);

    @Value("${app.notification.sms.enabled:true}")
    private boolean enabled;

    @Value("${app.notification.sms.sender-id:DESHI_COMM}")
    private String senderId;

    @Value("${app.notification.sms.provider:sandbox}")
    private String provider;

    public boolean sendSms(String recipientPhone, String message) {
        if (!enabled) {
            log.info("[SMS Disabled] Skipped sending to {}", recipientPhone);
            return false;
        }

        // Standardize Bangladesh phone number to 8801XXXXXXXXX format
        String normalizedPhone = normalizeBangladeshPhone(recipientPhone);

        log.info("[SMS Gateway - {}] SenderId: [{}], Recipient: [{}], Message: [{}]",
                provider.toUpperCase(), senderId, normalizedPhone, message);

        // Production gateways (e.g. Greenweb / SSL Wireless / Reve) would make HTTP POST here
        // In sandbox mode, returns true after audit logging
        return true;
    }

    private String normalizeBangladeshPhone(String phone) {
        if (phone == null) return "";
        String clean = phone.replaceAll("[^0-9]", "");
        if (clean.startsWith("880") && clean.length() == 13) {
            return clean;
        }
        if (clean.startsWith("01") && clean.length() == 11) {
            return "88" + clean;
        }
        return clean;
    }
}
