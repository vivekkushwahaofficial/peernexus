package com.peernexus.peernexus.auth.service.impl;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.peernexus.peernexus.auth.entity.RefreshToken;
import com.peernexus.peernexus.auth.repository.RefreshTokenRepository;
import com.peernexus.peernexus.auth.service.RefreshTokenService;
import com.peernexus.peernexus.exception.BadRequestException;
import com.peernexus.peernexus.user.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Manages refresh-token lifecycle with secure token hashing.
 *
 * <h2>Security design</h2>
 * <p>Refresh tokens are stored as <strong>SHA-256 hashes</strong>, not as
 * plaintext.  The flow is:
 * <ol>
 *   <li>Generate 32 random bytes from {@link SecureRandom} → Base64-URL encode
 *       → <em>raw token</em> (returned to the client once, never stored).</li>
 *   <li>SHA-256 hash the raw token → store the hex digest in the DB.</li>
 *   <li>On refresh: client sends raw token → hash it → look up the hash in DB.</li>
 * </ol>
 * This way, a DB compromise cannot be used to forge new tokens; the attacker
 * still needs the plaintext token the client holds.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final jakarta.persistence.EntityManager entityManager;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    // ── Public API ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // Delete any existing refresh token for this user (one token per user)
        refreshTokenRepository.deleteByUser(user);
        refreshTokenRepository.flush();

        // Generate a cryptographically secure 32-byte random token
        String rawToken  = generateSecureRawToken();
        String tokenHash = sha256Hex(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(rawToken)      // temporarily store raw so we can return it to the caller
                .expiryDate(Instant.now().plusMillis(refreshExpirationMs))
                .build();

        RefreshToken saved = refreshTokenRepository.save(refreshToken);

        // IMPORTANT: replace the raw token with the hash before it reaches the DB
        saved.setToken(tokenHash);
        refreshTokenRepository.saveAndFlush(saved);

        // Detach the entity from Hibernate persistence context to prevent dirty checking
        entityManager.detach(saved);

        // Return an entity whose token field holds the RAW value for the HTTP response
        saved.setToken(rawToken);
        log.debug("Refresh token created for user {}", user.getId());
        return saved;
    }

    @Override
    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new BadRequestException("Refresh token has expired. Please log in again.");
        }
        return token;
    }

    @Override
    @Transactional
    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    /**
     * Generates a 32-byte cryptographically random token encoded as Base64-URL
     * (no padding) — produces a 43-character opaque string.
     */
    private String generateSecureRawToken() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Returns the lowercase hex-encoded SHA-256 digest of the given string.
     * This is what is stored in the database instead of the raw token.
     *
     * @param raw the plaintext refresh token
     * @return 64-character hex SHA-256 digest
     */
    static String sha256Hex(String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(raw.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is mandated by the Java specification — this should never happen
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
