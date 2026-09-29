package com.example.SocialMedia.notification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Email Gateway Client.
 * Formats invoices and status notifications with HTML templates.
 */
@Component
public class EmailGatewayClient {

    private static final Logger log = LoggerFactory.getLogger(EmailGatewayClient.class);

    @Value("${app.notification.email.enabled:true}")
    private boolean enabled;

    @Value("${app.notification.email.from-address:no-reply@deshicommerce.com.bd}")
    private String fromAddress;

    @Value("${app.notification.email.from-name:Deshi Commerce}")
    private String fromName;

    public boolean sendEmail(String recipientEmail, String subject, String bodyHtml) {
        if (!enabled) {
            log.info("[Email Disabled] Skipped sending to {}", recipientEmail);
            return false;
        }

        log.info("[Email Gateway] From: [\"{}\" <{}>], To: [{}], Subject: [{}]",
                fromName, fromAddress, recipientEmail, subject);

        // Production SMTP or SendGrid/SES dispatch here.
        // In sandbox mode, records success after audit logging.
        return true;
    }
}
