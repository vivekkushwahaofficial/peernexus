package com.peernexus.peernexus.admin.dto;

import com.peernexus.peernexus.admin.entity.ReportStatus;

import jakarta.validation.constraints.NotNull;

/**
 * Payload sent by an admin/moderator to update the status of a report
 * and optionally add resolution notes.
 *
 * @param status     new lifecycle status for the report
 * @param adminNotes optional notes recorded by the moderator
 */
public record ReviewReportRequest(
        @NotNull ReportStatus status,
        String adminNotes
) {}
