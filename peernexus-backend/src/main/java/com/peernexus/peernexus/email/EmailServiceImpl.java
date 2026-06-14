package com.peernexus.peernexus.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Production implementation of {@link EmailService} that uses Spring's
 * {@link JavaMailSender} to dispatch real SMTP emails.
 *
 * <p>Configure the following properties in {@code application.properties}:
 * <pre>
 *   spring.mail.host=...
 *   spring.mail.port=587
 *   spring.mail.username=...
 *   spring.mail.password=...
 *   app.backend.base-url=http://localhost:8080
 *   app.mail.from=no-reply@peernexus.com
 * </pre>
 */
@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${app.backend.base-url:http://localhost:8080}")
    private String backendBaseUrl;

    @Value("${app.mail.from:no-reply@peernexus.com}")
    private String fromAddress;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }


    @Override
    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = backendBaseUrl + "/api/auth/reset-password?token=" + token;
        String subject = "PeerNexus – Reset your password";
        String body = """
                Hello,

                We received a request to reset your PeerNexus password.
                Click the link below to choose a new password:

                %s

                This link expires in 1 hour. If you did not request a password reset, please ignore this email.

                — The PeerNexus Team
                """.formatted(resetUrl);
        sendSimpleEmail(to, subject, body);
    }

    @Override
    public void sendSimpleEmail(String to, String subject, String body) {
        log.info("\n============================================================\n" +
                 "LOCAL DEVELOPMENT EMAIL OUTBOX:\n" +
                 "To: {}\n" +
                 "Subject: {}\n" +
                 "Body:\n{}\n" +
                 "============================================================", to, subject, body);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to {} | subject: {}", to, subject);
        } catch (MailException ex) {
            log.error("Failed to send email to {} | subject: {} | reason: {}", to, subject, ex.getMessage());
            // Do NOT rethrow: email delivery failures must never roll back business transactions.
        }
    }
}
