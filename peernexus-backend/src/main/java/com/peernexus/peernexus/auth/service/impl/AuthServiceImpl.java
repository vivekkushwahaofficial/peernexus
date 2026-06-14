package com.peernexus.peernexus.auth.service.impl;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.peernexus.peernexus.auth.dto.AuthResponse;
import com.peernexus.peernexus.auth.dto.LoginRequest;
import com.peernexus.peernexus.auth.dto.RefreshTokenRequest;
import com.peernexus.peernexus.auth.dto.RegisterRequest;
import com.peernexus.peernexus.auth.dto.ForgotPasswordRequest;
import com.peernexus.peernexus.auth.dto.ResetPasswordRequest;
import com.peernexus.peernexus.auth.dto.ResendVerificationRequest;
import com.peernexus.peernexus.auth.entity.EmailVerificationToken;
import com.peernexus.peernexus.auth.entity.PasswordResetToken;
import com.peernexus.peernexus.auth.entity.RefreshToken;
import com.peernexus.peernexus.auth.repository.EmailVerificationTokenRepository;
import com.peernexus.peernexus.auth.repository.PasswordResetTokenRepository;
import com.peernexus.peernexus.auth.repository.RefreshTokenRepository;
import com.peernexus.peernexus.auth.service.AuthService;
import com.peernexus.peernexus.auth.service.RefreshTokenService;
import com.peernexus.peernexus.auth.service.impl.RefreshTokenServiceImpl;
import com.peernexus.peernexus.config.security.JwtService;
import com.peernexus.peernexus.email.EmailService;
import com.peernexus.peernexus.exception.BadRequestException;
import com.peernexus.peernexus.exception.ResourceNotFoundException;
import com.peernexus.peernexus.user.dto.UserResponse;
import com.peernexus.peernexus.user.entity.Role;
import com.peernexus.peernexus.user.entity.User;
import com.peernexus.peernexus.user.mapper.UserMapper;
import com.peernexus.peernexus.user.repository.UserRepository;
import com.peernexus.peernexus.user.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;
    private final UserMapper userMapper;

    @Value("${app.backend.base-url:http://localhost:8080}")
    private String backendBaseUrl;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already in use");
        }
        // Enforce verified=true and enabled=true on registration for development
        User user = User.builder()
                .name(request.name())
                .email(request.email().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.STUDENT)
                .verified(true)
                .enabled(true)
                .build();
        User saved = userRepository.save(user);

        // Generate email verification token (generate, but don't send for development)
        String tokenVal = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(saved)
                .token(tokenVal)
                .expiryDate(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();
        emailVerificationTokenRepository.save(verificationToken);

        // TODO: Re-enable email verification after SMTP configuration
        /*
        String verificationUrl = backendBaseUrl + "/api/auth/verify?token=" + tokenVal;
        emailService.sendSimpleEmail(
                saved.getEmail(),
                "PeerNexus - Verify your Email Address",
                "Hello " + saved.getName() + ",\n\n" +
                "Thank you for registering on PeerNexus! Please click the link below to verify your email address:\n\n" +
                verificationUrl + "\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "The PeerNexus Team"
        );
        */

        UserResponse response = userMapper.toResponse(saved);
        return AuthResponse.builder()
                .accessToken(null)
                .refreshToken(null)
                .tokenType("Bearer")
                .user(response)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.email(), request.password()
        ));

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserDetailsImpl details = new UserDetailsImpl(user);
        String accessToken = jwtService.generateToken(details);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        // Hash the raw token received from the client before looking it up,
        // because only the SHA-256 hash is stored in the database.
        String tokenHash = RefreshTokenServiceImpl.sha256Hex(request.refreshToken());
        RefreshToken token = refreshTokenRepository.findByToken(tokenHash)
                .map(refreshTokenService::verifyExpiration)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        UserDetailsImpl details = new UserDetailsImpl(token.getUser());
        String accessToken = jwtService.generateToken(details);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(token.getToken())
                .tokenType("Bearer")
                .user(userMapper.toResponse(token.getUser()))
                .build();
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token"));

        if (verificationToken.isExpired()) {
            emailVerificationTokenRepository.delete(verificationToken);
            throw new BadRequestException("Verification token has expired");
        }

        User user = verificationToken.getUser();
        user.setVerified(true);
        user.setEnabled(true);
        userRepository.save(user);

        emailVerificationTokenRepository.delete(verificationToken);
    }

    @Override
    @Transactional
    public void resendVerificationEmail(ResendVerificationRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isVerified()) {
            throw new BadRequestException("User is already verified");
        }

        // Delete existing verification token if any
        emailVerificationTokenRepository.findByUser(user).ifPresent(emailVerificationTokenRepository::delete);

        // Generate new token
        String tokenVal = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(user)
                .token(tokenVal)
                .expiryDate(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();
        emailVerificationTokenRepository.save(verificationToken);

        // Send email
        String verificationUrl = backendBaseUrl + "/api/auth/verify?token=" + tokenVal;
        emailService.sendSimpleEmail(
                user.getEmail(),
                "PeerNexus - Verify your Email Address",
                "Hello " + user.getName() + ",\n\n" +
                "Please click the link below to verify your email address:\n\n" +
                verificationUrl + "\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "The PeerNexus Team"
        );
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Delete existing reset token if any
        passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

        // Generate reset token (expires in 1 hour)
        String tokenVal = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(tokenVal)
                .expiryDate(Instant.now().plus(1, ChronoUnit.HOURS))
                .build();
        passwordResetTokenRepository.save(resetToken);

        // Send password reset email
        emailService.sendPasswordResetEmail(user.getEmail(), tokenVal);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("Password reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
    }

    @Override
    @Transactional
    public void logout(RefreshTokenRequest request) {
        String tokenHash = RefreshTokenServiceImpl.sha256Hex(request.refreshToken());
        refreshTokenRepository.findByToken(tokenHash).ifPresent(refreshTokenRepository::delete);
    }
}
