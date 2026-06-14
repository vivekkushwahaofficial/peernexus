package com.peernexus.peernexus.admin.dto;

import java.time.Instant;

import com.peernexus.peernexus.admin.entity.ModerationActionType;
import com.peernexus.peernexus.admin.entity.ReportType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Payload sent by an admin/moderator to apply a moderation action
 * against a user or a piece of content.
 *
 * @param targetUserId      ID of the user to act against
 * @param actionType        type of action (WARNING, SUSPEND, BAN, DELETE_CONTENT)
 * @param reason            reason for the action (shown to the affected user)
 * @param suspendUntil      for SUSPEND: the expiry timestamp; null otherwise
 * @param targetContentId   for DELETE_CONTENT: the content's primary key
 * @param targetContentType for DELETE_CONTENT: the content type
 * @param linkedReportId    optional report this action resolves
 */
public record ModerationActionRequest(
        @NotNull Long targetUserId,
        @NotNull ModerationActionType actionType,
        @NotBlank String reason,
        Instant suspendUntil,
        Long targetContentId,
        ReportType targetContentType,
        Long linkedReportId
) {}
