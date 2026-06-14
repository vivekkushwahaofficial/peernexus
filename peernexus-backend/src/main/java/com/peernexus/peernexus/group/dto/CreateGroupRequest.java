package com.peernexus.peernexus.group.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for {@code POST /api/groups} (create a new study group).
 *
 * @param name        display name (required, 2–100 chars)
 * @param description optional description (max 1 000 chars)
 * @param topic       optional topic / subject tag (max 100 chars)
 * @param isPrivate   {@code true} = join requests require approval; default {@code false}
 */
public record CreateGroupRequest(
        @NotBlank(message = "Group name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        @Size(max = 100, message = "Topic must not exceed 100 characters")
        String topic,

        boolean isPrivate
) {}
