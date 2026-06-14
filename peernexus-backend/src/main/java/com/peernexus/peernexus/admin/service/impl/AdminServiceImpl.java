package com.peernexus.peernexus.admin.service.impl;

import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.peernexus.peernexus.admin.dto.AuditLogResponse;
import com.peernexus.peernexus.admin.dto.DashboardStats;
import com.peernexus.peernexus.admin.dto.ModerationActionRequest;
import com.peernexus.peernexus.admin.dto.ModerationActionResponse;
import com.peernexus.peernexus.admin.dto.ReportRequest;
import com.peernexus.peernexus.admin.dto.ReportResponse;
import com.peernexus.peernexus.admin.dto.ReviewReportRequest;
import com.peernexus.peernexus.admin.entity.AuditLog;
import com.peernexus.peernexus.admin.entity.ModerationAction;
import com.peernexus.peernexus.admin.entity.ModerationActionType;
import com.peernexus.peernexus.admin.entity.Report;
import com.peernexus.peernexus.admin.entity.ReportStatus;
import com.peernexus.peernexus.admin.entity.ReportType;
import com.peernexus.peernexus.admin.repository.AuditLogRepository;
import com.peernexus.peernexus.admin.repository.ModerationActionRepository;
import com.peernexus.peernexus.admin.repository.ReportRepository;
import com.peernexus.peernexus.admin.service.AdminService;
import com.peernexus.peernexus.answer.repository.AnswerRepository;
import com.peernexus.peernexus.chat.repository.MessageRepository;
import com.peernexus.peernexus.connection.entity.ConnectionStatus;
import com.peernexus.peernexus.connection.repository.ConnectionRepository;
import com.peernexus.peernexus.doubt.repository.DoubtRepository;
import com.peernexus.peernexus.exception.BadRequestException;
import com.peernexus.peernexus.exception.ResourceNotFoundException;
import com.peernexus.peernexus.exception.UnauthorizedException;
import com.peernexus.peernexus.group.repository.StudyGroupRepository;
import com.peernexus.peernexus.user.entity.User;
import com.peernexus.peernexus.user.repository.UserRepository;
import com.peernexus.peernexus.user.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Core implementation of the Admin &amp; Moderation business logic.
 *
 * <h2>Security</h2>
 * Role enforcement is applied at the controller layer via {@code @PreAuthorize}.
 * The service trusts that callers have been authorised and focuses solely on
 * business rules (duplicate-report checks, state transitions, etc.).
 *
 * <h2>Audit trail</h2>
 * Every state-changing operation writes an {@link AuditLog} record in the same
 * transaction so the trail is consistent with the action itself.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final ReportRepository           reportRepository;
    private final ModerationActionRepository moderationActionRepository;
    private final AuditLogRepository         auditLogRepository;
    private final UserRepository             userRepository;
    private final DoubtRepository            doubtRepository;
    private final AnswerRepository           answerRepository;
    private final MessageRepository          messageRepository;
    private final StudyGroupRepository       studyGroupRepository;
    private final ConnectionRepository       connectionRepository;

    // ── Dashboard ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        long totalUsers       = userRepository.count();
        long totalDoubts      = doubtRepository.count();
        long totalAnswers     = answerRepository.count();
        long totalGroups      = studyGroupRepository.count();
        long totalMessages    = messageRepository.count();
        long totalConnections = connectionRepository.countByStatus(ConnectionStatus.ACCEPTED);
        long openReports      = reportRepository.countByStatus(ReportStatus.OPEN);
        long resolvedReports  = reportRepository.countByStatus(ReportStatus.RESOLVED);

        log.debug("Dashboard stats fetched");
        return DashboardStats.builder()
                .totalUsers(totalUsers)
                .totalDoubts(totalDoubts)
                .totalAnswers(totalAnswers)
                .totalGroups(totalGroups)
                .totalMessages(totalMessages)
                .totalConnections(totalConnections)
                .openReports(openReports)
                .resolvedReports(resolvedReports)
                .build();
    }

    // ── Report management ─────────────────────────────────────────────────────

    @Override
    @Transactional
    public ReportResponse submitReport(ReportRequest request) {
        User reporter = resolveCurrentUser();

        // Prevent duplicate open reports by the same user against the same target
        if (reportRepository.existsOpenReport(reporter.getId(), request.type(), request.targetId())) {
            throw new BadRequestException(
                    "You have already submitted an open report for this content");
        }

        Report report = Report.builder()
                .reporter(reporter)
                .type(request.type())
                .targetId(request.targetId())
                .reason(request.reason())
                .status(ReportStatus.OPEN)
                .build();

        Report saved = reportRepository.save(report);

        writeAuditLog(reporter, "REPORT_SUBMITTED", request.type(), request.targetId(),
                "Report #" + saved.getId() + " submitted by user " + reporter.getId());

        log.debug("Report {} submitted by user {}", saved.getId(), reporter.getId());
        return toReportResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReportResponse> listReports(ReportStatus status, Pageable pageable) {
        if (status != null) {
            return reportRepository
                    .findByStatusOrderByCreatedAtDesc(status, pageable)
                    .map(this::toReportResponse);
        }
        return reportRepository
                .findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toReportResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReportResponse> listReportsByType(ReportType type, Pageable pageable) {
        return reportRepository
                .findByTypeOrderByCreatedAtDesc(type, pageable)
                .map(this::toReportResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ReportResponse getReport(Long reportId) {
        return toReportResponse(findReport(reportId));
    }

    @Override
    @Transactional
    public ReportResponse reviewReport(Long reportId, ReviewReportRequest request) {
        User reviewer = resolveCurrentUser();
        Report report = findReport(reportId);

        report.setStatus(request.status());
        report.setReviewedBy(reviewer);
        report.setAdminNotes(request.adminNotes());

        if (request.status() == ReportStatus.RESOLVED || request.status() == ReportStatus.REJECTED) {
            report.setResolvedAt(Instant.now());
        }

        Report saved = reportRepository.save(report);

        String action = request.status() == ReportStatus.REJECTED
                ? "REPORT_REJECTED" : "REPORT_REVIEWED";
        writeAuditLog(reviewer, action, report.getType(), report.getTargetId(),
                "Report #" + reportId + " → " + request.status());

        log.debug("Report {} reviewed by {} → {}", reportId, reviewer.getId(), request.status());
        return toReportResponse(saved);
    }

    // ── Moderation actions ────────────────────────────────────────────────────

    @Override
    @Transactional
    public ModerationActionResponse applyModerationAction(ModerationActionRequest request) {
        User actor = resolveCurrentUser();
        User targetUser = userRepository.findById(request.targetUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + request.targetUserId()));

        ModerationAction action = ModerationAction.builder()
                .actor(actor)
                .targetUser(targetUser)
                .actionType(request.actionType())
                .reason(request.reason())
                .suspendUntil(request.suspendUntil())
                .targetContentId(request.targetContentId())
                .targetContentType(request.targetContentType())
                .build();

        ModerationAction saved = moderationActionRepository.save(action);

        // Apply account-level effects
        applyAccountEffect(targetUser, request.actionType(), request.suspendUntil());

        // Auto-resolve linked report if provided
        if (request.linkedReportId() != null) {
            reportRepository.findById(request.linkedReportId()).ifPresent(report -> {
                report.setStatus(ReportStatus.RESOLVED);
                report.setReviewedBy(actor);
                report.setResolvedAt(Instant.now());
                report.setResolvedByAction(saved);
                reportRepository.save(report);
            });
        }

        // Derive audit action code
        String auditAction = switch (request.actionType()) {
            case WARNING        -> "USER_WARNED";
            case SUSPEND        -> "USER_SUSPENDED";
            case BAN            -> "USER_BANNED";
            case DELETE_CONTENT -> "CONTENT_DELETED";
        };

        ReportType auditTargetType = request.actionType() == ModerationActionType.DELETE_CONTENT
                ? request.targetContentType()
                : ReportType.USER;
        Long auditTargetId = request.actionType() == ModerationActionType.DELETE_CONTENT
                ? request.targetContentId()
                : targetUser.getId();

        writeAuditLog(actor, auditAction, auditTargetType, auditTargetId,
                "Action #" + saved.getId() + ": " + request.reason());

        log.debug("Moderation action {} applied by {} against user {}",
                request.actionType(), actor.getId(), targetUser.getId());
        return toActionResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ModerationActionResponse> listModerationActions(Pageable pageable) {
        return moderationActionRepository
                .findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toActionResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ModerationActionResponse> listActionsByUser(Long targetUserId, Pageable pageable) {
        return moderationActionRepository
                .findByTargetUserIdOrderByCreatedAtDesc(targetUserId, pageable)
                .map(this::toActionResponse);
    }

    // ── Audit logs ────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLog(Pageable pageable) {
        return auditLogRepository
                .findAllByOrderByPerformedAtDesc(pageable)
                .map(this::toAuditLogResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogByActor(Long actorId, Pageable pageable) {
        return auditLogRepository
                .findByActorIdOrderByPerformedAtDesc(actorId, pageable)
                .map(this::toAuditLogResponse);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Applies account-level effects such as disabling or suspending a user.
     * For BAN: sets {@code enabled = false} permanently.
     * For SUSPEND: sets {@code enabled = false} (a scheduled job should re-enable on expiry).
     * For WARNING/DELETE_CONTENT: no account change.
     */
    private void applyAccountEffect(User user, ModerationActionType type, Instant suspendUntil) {
        if (type == ModerationActionType.BAN || type == ModerationActionType.SUSPEND) {
            user.setEnabled(false);
            userRepository.save(user);
            log.info("User {} account disabled ({})", user.getId(), type);
        }
    }

    private Report findReport(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));
    }

    private User resolveCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl details) {
            return userRepository.findById(details.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        throw new UnauthorizedException("Unauthorized");
    }

    private void writeAuditLog(User actor, String action, ReportType targetType,
                               Long targetId, String details) {
        AuditLog log = AuditLog.builder()
                .actor(actor)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    // ── Mapping helpers ───────────────────────────────────────────────────────

    private ReportResponse toReportResponse(Report r) {
        return ReportResponse.builder()
                .id(r.getId())
                .reporterId(r.getReporter().getId())
                .reporterName(r.getReporter().getName())
                .type(r.getType())
                .targetId(r.getTargetId())
                .reason(r.getReason())
                .status(r.getStatus())
                .reviewedById(r.getReviewedBy() != null ? r.getReviewedBy().getId() : null)
                .reviewedByName(r.getReviewedBy() != null ? r.getReviewedBy().getName() : null)
                .adminNotes(r.getAdminNotes())
                .resolvedByActionId(r.getResolvedByAction() != null ? r.getResolvedByAction().getId() : null)
                .createdAt(r.getCreatedAt())
                .resolvedAt(r.getResolvedAt())
                .build();
    }

    private ModerationActionResponse toActionResponse(ModerationAction a) {
        return ModerationActionResponse.builder()
                .id(a.getId())
                .actorId(a.getActor().getId())
                .actorName(a.getActor().getName())
                .targetUserId(a.getTargetUser().getId())
                .targetUserName(a.getTargetUser().getName())
                .actionType(a.getActionType())
                .reason(a.getReason())
                .suspendUntil(a.getSuspendUntil())
                .targetContentId(a.getTargetContentId())
                .targetContentType(a.getTargetContentType())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private AuditLogResponse toAuditLogResponse(AuditLog l) {
        return AuditLogResponse.builder()
                .id(l.getId())
                .actorId(l.getActor() != null ? l.getActor().getId() : null)
                .actorName(l.getActor() != null ? l.getActor().getName() : null)
                .action(l.getAction())
                .targetType(l.getTargetType())
                .targetId(l.getTargetId())
                .details(l.getDetails())
                .performedAt(l.getPerformedAt())
                .build();
    }
}
