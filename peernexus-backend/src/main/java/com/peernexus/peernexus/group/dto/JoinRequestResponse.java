package com.peernexus.peernexus.group.dto;

import java.time.Instant;

import com.peernexus.peernexus.group.entity.JoinRequestStatus;

import lombok.Builder;

/**
 * Represents a join request as shown to OWNER / ADMIN decision-makers.
 *
 * @param id           join request primary key
 * @param groupId      target group
 * @param groupName    target group name
 * @param requesterId  the applicant's user ID
 * @param requesterName the applicant's display name
 * @param message      optional message from the applicant
 * @param status       PENDING | APPROVED | REJECTED
 * @param createdAt    when the request was submitted
 * @param reviewedAt   when the decision was made (null if still pending)
 */
@Builder
public record JoinRequestResponse(
        Long id,
        Long groupId,
        String groupName,
        Long requesterId,
        String requesterName,
        String requesterEmail,
        String message,
        JoinRequestStatus status,
        Instant createdAt,
        Instant reviewedAt
) {}
