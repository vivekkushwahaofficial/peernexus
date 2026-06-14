package com.peernexus.peernexus.admin.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.peernexus.peernexus.admin.dto.AuditLogResponse;
import com.peernexus.peernexus.admin.dto.DashboardStats;
import com.peernexus.peernexus.admin.dto.ModerationActionRequest;
import com.peernexus.peernexus.admin.dto.ModerationActionResponse;
import com.peernexus.peernexus.admin.dto.ReportRequest;
import com.peernexus.peernexus.admin.dto.ReportResponse;
import com.peernexus.peernexus.admin.dto.ReviewReportRequest;
import com.peernexus.peernexus.admin.entity.ReportStatus;
import com.peernexus.peernexus.admin.entity.ReportType;

/**
 * Business-logic interface for the Admin &amp; Moderation module.
 *
 * <h2>Role-based access</h2>
 * <ul>
 *   <li>Any authenticated user may submit a report.</li>
 *   <li>MODERATOR and ADMIN can review reports, list all reports, and apply moderation actions.</li>
 *   <li>Only ADMIN can access the dashboard stats and full audit log.</li>
 * </ul>
 */
public interface AdminService {

    // ── Dashboard ─────────────────────────────────────────────────────────────

    /**
     * Returns aggregate platform statistics for the admin dashboard.
     * Requires ADMIN role.
     *
     * @return dashboard stats snapshot
     */
    DashboardStats getDashboardStats();

    // ── Report management ─────────────────────────────────────────────────────

    /**
     * Submits an abuse report from the currently authenticated user.
     * Duplicate open/reviewing reports against the same target by the same
     * user are rejected with a {@link com.peernexus.peernexus.exception.BadRequestException}.
     *
     * @param request report payload
     * @return the persisted report
     */
    ReportResponse submitReport(ReportRequest request);

    /**
     * Returns all reports (optionally filtered by status), newest first.
     * Requires MODERATOR or ADMIN role.
     *
     * @param status   filter by status; {@code null} returns all statuses
     * @param pageable pagination params
     * @return paged list of reports
     */
    Page<ReportResponse> listReports(ReportStatus status, Pageable pageable);

    /**
     * Returns all reports of a specific type (optionally filtered by status).
     * Requires MODERATOR or ADMIN role.
     *
     * @param type     the report type to filter by
     * @param pageable pagination params
     * @return paged list of reports
     */
    Page<ReportResponse> listReportsByType(ReportType type, Pageable pageable);

    /**
     * Returns the full detail of a single report.
     * Requires MODERATOR or ADMIN role.
     *
     * @param reportId the report primary key
     * @return the report
     */
    ReportResponse getReport(Long reportId);

    /**
     * Updates the status and/or admin notes of a report.
     * Requires MODERATOR or ADMIN role.
     *
     * @param reportId the report primary key
     * @param request  the review payload
     * @return the updated report
     */
    ReportResponse reviewReport(Long reportId, ReviewReportRequest request);

    // ── Moderation actions ────────────────────────────────────────────────────

    /**
     * Applies a moderation enforcement action against a user or content.
     * Requires MODERATOR or ADMIN role.
     *
     * <p>If {@code request.linkedReportId()} is provided, the linked report is
     * automatically moved to {@link ReportStatus#RESOLVED}.
     *
     * @param request moderation action payload
     * @return the created moderation action record
     */
    ModerationActionResponse applyModerationAction(ModerationActionRequest request);

    /**
     * Returns all moderation actions, newest first.
     * Requires MODERATOR or ADMIN role.
     *
     * @param pageable pagination params
     * @return paged list of actions
     */
    Page<ModerationActionResponse> listModerationActions(Pageable pageable);

    /**
     * Returns all moderation actions targeting a specific user.
     * Requires MODERATOR or ADMIN role.
     *
     * @param targetUserId the user's primary key
     * @param pageable     pagination params
     * @return paged list of actions against this user
     */
    Page<ModerationActionResponse> listActionsByUser(Long targetUserId, Pageable pageable);

    // ── Audit logs ────────────────────────────────────────────────────────────

    /**
     * Returns the full audit log, newest first.
     * Requires ADMIN role.
     *
     * @param pageable pagination params
     * @return paged list of audit entries
     */
    Page<AuditLogResponse> getAuditLog(Pageable pageable);

    /**
     * Returns audit log entries filtered by actor (admin/moderator).
     * Requires ADMIN role.
     *
     * @param actorId  the actor's user primary key
     * @param pageable pagination params
     * @return paged list of audit entries by this actor
     */
    Page<AuditLogResponse> getAuditLogByActor(Long actorId, Pageable pageable);
}
