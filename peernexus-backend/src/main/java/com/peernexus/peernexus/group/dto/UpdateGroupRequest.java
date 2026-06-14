package com.peernexus.peernexus.group.dto;

import jakarta.validation.constraints.Size;

/**
 * Request body for {@code PUT /api/groups/{id}} (update group metadata).
 * All fields are optional; only non-null values are applied.
 *
 * @param name        new display name (2–100 chars if provided)
 * @param description new description (max 1 000 chars)
 * @param topic       new topic tag (max 100 chars)
 * @param isPrivate   change the privacy setting
 */
public record UpdateGroupRequest(
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        @Size(max = 100, message = "Topic must not exceed 100 characters")
        String topic,

        Boolean isPrivate
) {}
