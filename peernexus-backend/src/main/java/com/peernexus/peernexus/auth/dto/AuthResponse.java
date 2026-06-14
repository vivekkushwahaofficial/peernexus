package com.peernexus.peernexus.auth.dto;

import com.peernexus.peernexus.user.dto.UserResponse;

import lombok.Builder;

@Builder
public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        UserResponse user
        ) {

}
