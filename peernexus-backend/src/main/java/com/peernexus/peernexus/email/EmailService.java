package com.peernexus.peernexus.email;

/**
 * Service interface for sending application emails.
 * Implementations may delegate to JavaMailSender (production) or a no-op stub (testing).
 */
public interface EmailService {


    /**
     * Sends a password-reset link to the user who requested it.
     *
     * @param to    recipient email address
     * @param token the raw password-reset token to embed in the link
     */
    void sendPasswordResetEmail(String to, String token);

    /**
     * Sends a plain-text email with a custom subject and body.
     *
     * @param to      recipient email address
     * @param subject email subject line
     * @param body    plain-text email body
     */
    void sendSimpleEmail(String to, String subject, String body);
}
