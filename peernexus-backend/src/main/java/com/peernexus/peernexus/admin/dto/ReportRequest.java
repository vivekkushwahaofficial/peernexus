package com.peernexus.peernexus.admin.dto;

import com.peernexus.peernexus.admin.entity.ReportType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Payload sent by a user to submit an abuse report.
 *
 * @param type     what kind of content is being reported
 * @param targetId primary key of the reported entity
 * @param reason   human-readable description of the violation (required)
 */
public record ReportRequest(
        @NotNull ReportType type,
        @NotNull Long targetId,
        @NotBlank String reason
) {}
