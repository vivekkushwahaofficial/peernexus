package com.peernexus.peernexus.auth.service;

import com.peernexus.peernexus.auth.dto.AuthResponse;
import com.peernexus.peernexus.auth.dto.LoginRequest;
import com.peernexus.peernexus.auth.dto.RefreshTokenRequest;
import com.peernexus.peernexus.auth.dto.RegisterRequest;
import com.peernexus.peernexus.auth.dto.ForgotPasswordRequest;
import com.peernexus.peernexus.auth.dto.ResetPasswordRequest;
import com.peernexus.peernexus.auth.dto.ResendVerificationRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    void verifyEmail(String token);

    void resendVerificationEmail(ResendVerificationRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void logout(RefreshTokenRequest request);
}
