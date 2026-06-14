package com.peernexus.peernexus.group.dto;

import jakarta.validation.constraints.Size;

/**
 * Request body for {@code POST /api/groups/{id}/join-requests}
 * (submit a request to join a private group).
 *
 * @param message optional message accompanying the request (max 500 chars)
 */
public record JoinRequestBody(
        @Size(max = 500, message = "Message must not exceed 500 characters")
        String message
) {}
