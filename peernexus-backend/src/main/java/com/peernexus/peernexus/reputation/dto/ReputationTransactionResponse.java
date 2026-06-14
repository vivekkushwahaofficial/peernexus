package com.peernexus.peernexus.reputation.dto;

import java.time.Instant;

import com.peernexus.peernexus.reputation.entity.ReputationEventType;

import lombok.Builder;

@Builder
public record ReputationTransactionResponse(
        Long id,
        ReputationEventType type,
        int points,
        String referenceType,
        Long referenceId,
        Instant createdAt
        ) {

}
