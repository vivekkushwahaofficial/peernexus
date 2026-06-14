package com.peernexus.peernexus.admin.entity;

import java.time.Instant;

import com.peernexus.peernexus.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A user-submitted abuse report targeting a specific piece of content or user.
 *
 * <p>The {@code targetId} is a generic foreign key: its meaning depends on
 * {@link #type}:
 * <ul>
 *   <li>{@code USER}    – {@code targetId} is a {@code users.id}</li>
 *   <li>{@code DOUBT}   – {@code targetId} is a {@code doubts.id}</li>
 *   <li>{@code ANSWER}  – {@code targetId} is an {@code answers.id}</li>
 *   <li>{@code MESSAGE} – {@code targetId} is a {@code messages.id} or {@code group_messages.id}</li>
 *   <li>{@code GROUP}   – {@code targetId} is a {@code study_groups.id}</li>
 * </ul>
 *
 * <p>A {@link ModerationAction} record is created and linked via
 * {@link #resolvedByAction} when the report is acted upon.
 */
@Entity
@Table(
        name = "reports",
        indexes = {
                @Index(name = "idx_reports_status_created", columnList = "status, created_at DESC")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user who submitted this report. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    /**
     * Discriminates what {@code targetId} refers to.
     * Stored as a string for readability.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportType type;

    /**
     * Primary key of the reported entity (user, doubt, answer, message, or group).
     * This is a generic reference — no DB-level FK constraint because the target
     * table varies by {@link #type}.
     */
    @Column(nullable = false)
    private Long targetId;

    /**
     * Human-readable description of why the content was reported.
     * Required so moderators understand the context without looking up the content.
     */
    @Column(nullable = false, length = 1000)
    private String reason;

    /** Current lifecycle status of this report. */
    @Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportStatus status = ReportStatus.OPEN;

    /**
     * The admin/moderator who reviewed this report.
     * {@code null} until a moderator picks it up.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;

    /**
     * Admin notes / resolution remarks added during review.
     * {@code null} if not yet reviewed.
     */
    @Column(length = 1000)
    private String adminNotes;

    /**
     * The moderation action taken as a result of this report.
     * {@code null} if the report is still OPEN or REJECTED without action.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by_action_id")
    private ModerationAction resolvedByAction;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant resolvedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
