package com.peernexus.peernexus.connection.dto;

import com.peernexus.peernexus.reputation.entity.ReputationLevel;
import com.peernexus.peernexus.user.entity.Role;

import lombok.Builder;

@Builder
public record ConnectionUserSummary(
        Long id,
        String name,
        Role role,
        boolean verified,
        int reputationPoints,
        ReputationLevel reputationLevel
        ) {

}
