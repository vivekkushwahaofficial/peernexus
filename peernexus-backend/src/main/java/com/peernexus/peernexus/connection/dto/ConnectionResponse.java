package com.peernexus.peernexus.connection.dto;

import java.time.Instant;

import com.peernexus.peernexus.connection.entity.ConnectionStatus;

import lombok.Builder;

@Builder
public record ConnectionResponse(
        Long id,
        ConnectionUserSummary requester,
        ConnectionUserSummary recipient,
        ConnectionStatus status,
        Instant createdAt
        ) {

}
