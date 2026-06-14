package com.peernexus.peernexus.admin.dto;

import java.time.Instant;

import com.peernexus.peernexus.admin.entity.ReportType;

import lombok.Builder;

/**
 * Outbound representation of an {@link com.peernexus.peernexus.admin.entity.AuditLog} entry.
 *
 * @param id          audit log primary key
 * @param actorId     ID of the admin/moderator who performed the action
 * @param actorName   display name of the actor
 * @param action      short action code (e.g. {@code USER_BANNED}, {@code CONTENT_DELETED})
 * @param targetType  type of the affected entity (may be null for system events)
 * @param targetId    primary key of the affected entity
 * @param details     free-text details / resolution notes
 * @param performedAt timestamp the action was recorded
 */
@Builder
public record AuditLogResponse(
        Long id,
        Long actorId,
        String actorName,
        String action,
        ReportType targetType,
        Long targetId,
        String details,
        Instant performedAt
) {}
