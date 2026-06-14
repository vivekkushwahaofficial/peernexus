package com.peernexus.peernexus.admin.dto;

import java.time.Instant;

import com.peernexus.peernexus.admin.entity.ReportStatus;
import com.peernexus.peernexus.admin.entity.ReportType;

import lombok.Builder;

/**
 * Outbound representation of a {@link com.peernexus.peernexus.admin.entity.Report}.
 *
 * @param id                 report primary key
 * @param reporterId         user who submitted the report
 * @param reporterName       display name of the reporter
 * @param type               type of content being reported
 * @param targetId           primary key of the reported entity
 * @param reason             reporter-supplied description
 * @param status             current lifecycle status
 * @param reviewedById       moderator who reviewed it (null if not yet reviewed)
 * @param reviewedByName     display name of the reviewer
 * @param adminNotes         moderator resolution notes
 * @param resolvedByActionId linked moderation action ID (null if not resolved)
 * @param createdAt          when the report was submitted
 * @param resolvedAt         when the report was resolved/rejected
 */
@Builder
public record ReportResponse(
        Long id,
        Long reporterId,
        String reporterName,
        ReportType type,
        Long targetId,
        String reason,
        ReportStatus status,
        Long reviewedById,
        String reviewedByName,
        String adminNotes,
        Long resolvedByActionId,
        Instant createdAt,
        Instant resolvedAt
) {}
