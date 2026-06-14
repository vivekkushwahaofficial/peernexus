package com.peernexus.peernexus.auth.service;

import java.time.Instant;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.peernexus.peernexus.auth.repository.EmailVerificationTokenRepository;
import com.peernexus.peernexus.auth.repository.PasswordResetTokenRepository;
import com.peernexus.peernexus.auth.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class TokenCleanupScheduler {

    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    /**
     * Periodically clean up expired refresh, verification, and reset tokens.
     * Scheduled to run once per hour (3600000ms delay).
     */
    @Scheduled(fixedDelay = 3600000)
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Starting scheduled cleanup of expired security tokens...");
        Instant now = Instant.now();

        try {
            refreshTokenRepository.deleteByExpiryDateBefore(now);
            log.info("Cleared expired refresh tokens.");
        } catch (Exception e) {
            log.error("Failed to clean up expired refresh tokens", e);
        }

        try {
            emailVerificationTokenRepository.deleteByExpiryDateBefore(now);
            log.info("Cleared expired email verification tokens.");
        } catch (Exception e) {
            log.error("Failed to clean up expired email verification tokens", e);
        }

        try {
            passwordResetTokenRepository.deleteByExpiryDateBefore(now);
            log.info("Cleared expired password reset tokens.");
        } catch (Exception e) {
            log.error("Failed to clean up expired password reset tokens", e);
        }
    }
}
