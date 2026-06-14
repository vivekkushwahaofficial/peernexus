package com.peernexus.peernexus.user.dto;

import com.peernexus.peernexus.reputation.entity.ReputationLevel;
import com.peernexus.peernexus.user.entity.Role;

import lombok.Builder;

@Builder
public record UserResponse(
        Long id,
        String name,
        String email,
        Role role,
        boolean verified,
        int reputationPoints,
        ReputationLevel reputationLevel,
        String profilePicture,
        String bio,
        String skills,
        String interests
        ) {

}
