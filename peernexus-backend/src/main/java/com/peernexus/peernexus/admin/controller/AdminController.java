package com.peernexus.peernexus.admin.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.peernexus.peernexus.admin.dto.AuditLogResponse;
import com.peernexus.peernexus.admin.dto.DashboardStats;
import com.peernexus.peernexus.admin.dto.ModerationActionRequest;
import com.peernexus.peernexus.admin.dto.ModerationActionResponse;
import com.peernexus.peernexus.admin.dto.ReportRequest;
import com.peernexus.peernexus.admin.dto.ReportResponse;
import com.peernexus.peernexus.admin.dto.ReviewReportRequest;
import com.peernexus.peernexus.admin.entity.ReportStatus;
import com.peernexus.peernexus.admin.entity.ReportType;
import com.peernexus.peernexus.admin.service.AdminService;
import com.peernexus.peernexus.common.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST controller for the Admin &amp; Moderation module.
 *
 * <h2>Role-based access summary</h2>
 * <pre>
 * Any authenticated user:
 *   POST /api/admin/reports                        – submit an abuse report
 *
 * MODERATOR or ADMIN:
 *   GET  /api/admin/reports                        – list all reports (filterable by status/type)
 *   GET  /api/admin/reports/{reportId}             – get a single report
 *   PUT  /api/admin/reports/{reportId}/review      – update report status + admin notes
 *   POST /api/admin/moderation/actions             – apply warning / suspend / ban / delete
 *   GET  /api/admin/moderation/actions             – list all moderation actions
 *   GET  /api/admin/moderation/actions/user/{id}   – actions against a specific user
 *
 * ADMIN only:
 *   GET  /api/admin/dashboard                      – platform statistics
 *   GET  /api/admin/audit-log                      – full audit trail
 *   GET  /api/admin/audit-log/actor/{actorId}      – audit trail filtered by actor
 * </pre>
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ── Dashboard ─────────────────────────────────────────────────────────────

    /**
     * Returns aggregate platform statistics for the admin dashboard.
     * Requires ADMIN role.
     *
     * @return platform-wide counts and open report badge numbers
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboardStats() {
        DashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.<DashboardStats>builder()
                .success(true)
                .message("Dashboard statistics retrieved")
                .data(stats)
                .build());
    }

    // ── Report management ─────────────────────────────────────────────────────

    /**
     * Submits an abuse report.  Any authenticated user may report content.
     *
     * @param request report payload containing type, targetId, and reason
     * @return the created report
     */
    @PostMapping("/reports")
    public ResponseEntity<ApiResponse<ReportResponse>> submitReport(
            @Valid @RequestBody ReportRequest request
    ) {
        ReportResponse response = adminService.submitReport(request);
        return ResponseEntity.ok(ApiResponse.<ReportResponse>builder()
                .success(true)
                .message("Report submitted successfully")
                .data(response)
                .build());
    }

    /**
     * Lists all reports, optionally filtered by status and/or type.
     * Requires MODERATOR or ADMIN role.
     *
     * @param status   optional filter (OPEN, REVIEWING, RESOLVED, REJECTED)
     * @param type     optional filter (USER, DOUBT, ANSWER, MESSAGE, GROUP)
     * @param pageable pagination params
     * @return paged list of reports
     */
    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> listReports(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) ReportType type,
            Pageable pageable
    ) {
        Page<ReportResponse> reports = type != null
                ? adminService.listReportsByType(type, pageable)
                : adminService.listReports(status, pageable);

        return ResponseEntity.ok(ApiResponse.<Page<ReportResponse>>builder()
                .success(true)
                .message("Reports retrieved")
                .data(reports)
                .build());
    }

    /**
     * Returns the full detail of a single report.
     * Requires MODERATOR or ADMIN role.
     *
     * @param reportId the report primary key
     * @return the report
     */
    @GetMapping("/reports/{reportId}")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<ReportResponse>> getReport(
            @PathVariable Long reportId
    ) {
        return ResponseEntity.ok(ApiResponse.<ReportResponse>builder()
                .success(true)
                .message("Report retrieved")
                .data(adminService.getReport(reportId))
                .build());
    }

    /**
     * Updates the status and admin notes of a report.
     * Requires MODERATOR or ADMIN role.
     *
     * @param reportId the report primary key
     * @param request  the review payload
     * @return the updated report
     */
    @PutMapping("/reports/{reportId}/review")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<ReportResponse>> reviewReport(
            @PathVariable Long reportId,
            @Valid @RequestBody ReviewReportRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.<ReportResponse>builder()
                .success(true)
                .message("Report updated")
                .data(adminService.reviewReport(reportId, request))
                .build());
    }

    // ── Moderation actions ────────────────────────────────────────────────────

    /**
     * Applies a moderation enforcement action (warning, suspend, ban, or content deletion).
     * Requires MODERATOR or ADMIN role.
     *
     * <p>If {@code linkedReportId} is provided, the linked report is automatically
     * moved to RESOLVED status.
     *
     * @param request moderation action payload
     * @return the created moderation action record
     */
    @PostMapping("/moderation/actions")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<ModerationActionResponse>> applyAction(
            @Valid @RequestBody ModerationActionRequest request
    ) {
        ModerationActionResponse response = adminService.applyModerationAction(request);
        return ResponseEntity.ok(ApiResponse.<ModerationActionResponse>builder()
                .success(true)
                .message("Moderation action applied")
                .data(response)
                .build());
    }

    /**
     * Lists all moderation actions, newest first.
     * Requires MODERATOR or ADMIN role.
     *
     * @param pageable pagination params
     * @return paged list of actions
     */
    @GetMapping("/moderation/actions")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<ModerationActionResponse>>> listActions(
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.<Page<ModerationActionResponse>>builder()
                .success(true)
                .message("Moderation actions retrieved")
                .data(adminService.listModerationActions(pageable))
                .build());
    }

    /**
     * Lists all moderation actions targeting a specific user.
     * Requires MODERATOR or ADMIN role.
     *
     * @param userId   the target user's primary key
     * @param pageable pagination params
     * @return paged list of actions against this user
     */
    @GetMapping("/moderation/actions/user/{userId}")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<ModerationActionResponse>>> listActionsByUser(
            @PathVariable Long userId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.<Page<ModerationActionResponse>>builder()
                .success(true)
                .message("User moderation history retrieved")
                .data(adminService.listActionsByUser(userId, pageable))
                .build());
    }

    // ── Audit logs ────────────────────────────────────────────────────────────

    /**
     * Returns the full audit log (all admin/moderator actions), newest first.
     * Requires ADMIN role.
     *
     * @param pageable pagination params
     * @return paged audit log
     */
    @GetMapping("/audit-log")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getAuditLog(
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.<Page<AuditLogResponse>>builder()
                .success(true)
                .message("Audit log retrieved")
                .data(adminService.getAuditLog(pageable))
                .build());
    }

    /**
     * Returns audit log entries filtered by actor (admin/moderator who performed the action).
     * Requires ADMIN role.
     *
     * @param actorId  the actor's user primary key
     * @param pageable pagination params
     * @return paged audit log for this actor
     */
    @GetMapping("/audit-log/actor/{actorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getAuditLogByActor(
            @PathVariable Long actorId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.<Page<AuditLogResponse>>builder()
                .success(true)
                .message("Actor audit log retrieved")
                .data(adminService.getAuditLogByActor(actorId, pageable))
                .build());
    }
}
