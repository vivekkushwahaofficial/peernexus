package com.peernexus.peernexus.group.dto;

import java.time.Instant;

import com.peernexus.peernexus.group.entity.GroupRole;

import lombok.Builder;

/**
 * Public representation of a {@link com.peernexus.peernexus.group.entity.StudyGroup}
 * as seen from the caller's perspective.
 *
 * @param id          primary key
 * @param name        display name
 * @param description optional description
 * @param topic       optional topic tag
 * @param imageUrl    Cloudinary HTTPS URL of the group image (may be null)
 * @param isPrivate   whether the group requires join-request approval
 * @param memberCount current number of active members
 * @param myRole      the caller's role in this group; {@code null} if not a member
 * @param createdAt   group creation timestamp
 */
@Builder
public record GroupResponse(
        Long id,
        String name,
        String description,
        String topic,
        String imageUrl,
        boolean isPrivate,
        int memberCount,
        GroupRole myRole,
        Long ownerId,
        String ownerName,
        Instant createdAt
) {}
