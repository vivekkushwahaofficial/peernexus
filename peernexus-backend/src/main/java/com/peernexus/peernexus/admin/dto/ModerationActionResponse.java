package com.peernexus.peernexus.admin.dto;

import java.time.Instant;

import com.peernexus.peernexus.admin.entity.ModerationActionType;
import com.peernexus.peernexus.admin.entity.ReportType;

import lombok.Builder;

/**
 * Outbound representation of a {@link com.peernexus.peernexus.admin.entity.ModerationAction}.
 *
 * @param id                 action primary key
 * @param actorId            admin/moderator who performed the action
 * @param actorName          display name of the actor
 * @param targetUserId       user affected by the action
 * @param targetUserName     display name of the target user
 * @param actionType         kind of action taken
 * @param reason             reason provided by the actor
 * @param suspendUntil       suspension end time (SUSPEND only)
 * @param targetContentId    deleted content ID (DELETE_CONTENT only)
 * @param targetContentType  deleted content type (DELETE_CONTENT only)
 * @param createdAt          timestamp the action was recorded
 */
@Builder
public record ModerationActionResponse(
        Long id,
        Long actorId,
        String actorName,
        Long targetUserId,
        String targetUserName,
        ModerationActionType actionType,
        String reason,
        Instant suspendUntil,
        Long targetContentId,
        ReportType targetContentType,
        Instant createdAt
) {}
