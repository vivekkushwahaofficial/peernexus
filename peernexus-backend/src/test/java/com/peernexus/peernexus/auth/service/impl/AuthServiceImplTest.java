package com.peernexus.peernexus.auth.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.peernexus.peernexus.auth.dto.ForgotPasswordRequest;
import com.peernexus.peernexus.auth.dto.RegisterRequest;
import com.peernexus.peernexus.auth.dto.ResetPasswordRequest;
import com.peernexus.peernexus.auth.dto.ResendVerificationRequest;
import com.peernexus.peernexus.auth.entity.EmailVerificationToken;
import com.peernexus.peernexus.auth.entity.PasswordResetToken;
import com.peernexus.peernexus.auth.entity.RefreshToken;
import com.peernexus.peernexus.auth.repository.EmailVerificationTokenRepository;
import com.peernexus.peernexus.auth.repository.PasswordResetTokenRepository;
import com.peernexus.peernexus.auth.repository.RefreshTokenRepository;
import com.peernexus.peernexus.config.security.JwtService;
import com.peernexus.peernexus.email.EmailService;
import com.peernexus.peernexus.exception.BadRequestException;
import com.peernexus.peernexus.exception.ResourceNotFoundException;
import com.peernexus.peernexus.user.dto.UserResponse;
import com.peernexus.peernexus.user.entity.User;
import com.peernexus.peernexus.user.mapper.UserMapper;
import com.peernexus.peernexus.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private EmailService emailService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .password("encoded_password")
                .verified(false)
                .enabled(false)
                .build();
    }

    @Test
    void register_Success() {
        RegisterRequest request = new RegisterRequest("John Doe", "john@example.com", "password123");
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userMapper.toResponse(any(User.class))).thenReturn(UserResponse.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .role(com.peernexus.peernexus.user.entity.Role.STUDENT)
                .verified(false)
                .reputationPoints(0)
                .reputationLevel(com.peernexus.peernexus.reputation.entity.ReputationLevel.BEGINNER)
                .build());

        var response = authService.register(request);

        assertNotNull(response);
        verify(userRepository, times(1)).save(any(User.class));
        verify(emailVerificationTokenRepository, times(1)).save(any(EmailVerificationToken.class));
        verify(emailService, times(1)).sendSimpleEmail(anyString(), anyString(), anyString());
    }

    @Test
    void register_EmailAlreadyExists_ThrowsBadRequest() {
        RegisterRequest request = new RegisterRequest("John Doe", "john@example.com", "password123");
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void verifyEmail_Success() {
        String tokenVal = "valid-token";
        EmailVerificationToken token = EmailVerificationToken.builder()
                .user(testUser)
                .token(tokenVal)
                .expiryDate(Instant.now().plusSeconds(3600))
                .build();

        when(emailVerificationTokenRepository.findByToken(tokenVal)).thenReturn(Optional.of(token));

        authService.verifyEmail(tokenVal);

        assertTrue(testUser.isVerified());
        assertTrue(testUser.isEnabled());
        verify(userRepository, times(1)).save(testUser);
        verify(emailVerificationTokenRepository, times(1)).delete(token);
    }

    @Test
    void verifyEmail_ExpiredToken_ThrowsBadRequest() {
        String tokenVal = "expired-token";
        EmailVerificationToken token = EmailVerificationToken.builder()
                .user(testUser)
                .token(tokenVal)
                .expiryDate(Instant.now().minusSeconds(3600))
                .build();

        when(emailVerificationTokenRepository.findByToken(tokenVal)).thenReturn(Optional.of(token));

        assertThrows(BadRequestException.class, () -> authService.verifyEmail(tokenVal));
        verify(emailVerificationTokenRepository, times(1)).delete(token);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void forgotPassword_Success() {
        ForgotPasswordRequest request = new ForgotPasswordRequest("john@example.com");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(passwordResetTokenRepository.findByUser(testUser)).thenReturn(Optional.empty());

        authService.forgotPassword(request);

        verify(passwordResetTokenRepository, times(1)).save(any(PasswordResetToken.class));
        verify(emailService, times(1)).sendPasswordResetEmail(eq("john@example.com"), anyString());
    }

    @Test
    void resetPassword_Success() {
        ResetPasswordRequest request = new ResetPasswordRequest("reset-token", "newpassword123");
        PasswordResetToken token = PasswordResetToken.builder()
                .user(testUser)
                .token("reset-token")
                .expiryDate(Instant.now().plusSeconds(3600))
                .build();

        when(passwordResetTokenRepository.findByToken("reset-token")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("newpassword123")).thenReturn("encoded_new_password");

        authService.resetPassword(request);

        assertEquals("encoded_new_password", testUser.getPassword());
        verify(userRepository, times(1)).save(testUser);
        verify(passwordResetTokenRepository, times(1)).delete(token);
    }
}
