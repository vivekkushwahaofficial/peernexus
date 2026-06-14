package com.peernexus.peernexus.group.dto;

import java.time.Instant;

import com.peernexus.peernexus.group.entity.GroupRole;

import lombok.Builder;

/**
 * Represents a single member's record within a study group.
 *
 * @param memberId   the {@link com.peernexus.peernexus.group.entity.GroupMember} record ID
 * @param userId     the user's primary key
 * @param userName   the user's display name
 * @param userEmail  the user's email
 * @param role       the user's current role in the group
 * @param joinedAt   when the user joined
 */
@Builder
public record GroupMemberResponse(
        Long memberId,
        Long userId,
        String userName,
        String userEmail,
        String userProfilePicture,
        GroupRole role,
        Instant joinedAt
) {}
