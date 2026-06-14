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
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Immutable audit trail entry for every admin or moderation action taken on the platform.
 *
 * <p>A new {@link AuditLog} record is written automatically by the service layer
 * whenever a significant administrative event occurs (report reviewed, user banned,
 * content deleted, dashboard accessed, etc.).  Records are append-only and must
 * never be updated or deleted.
 *
 * <p>The triple {@code (actorId, action, targetId)} plus {@code performedAt}
 * provides a full timeline of platform governance.
 */
@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The admin or moderator who performed the action.
     * {@code null} if the action was system-generated.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    /**
     * Short code describing the action performed.
     * Examples: {@code REPORT_REVIEWED}, {@code USER_BANNED}, {@code CONTENT_DELETED},
     * {@code USER_WARNED}, {@code USER_SUSPENDED}, {@code REPORT_REJECTED}.
     */
    @Column(nullable = false, length = 60)
    private String action;

    /**
     * The type of entity the action targets (for filtering / display purposes).
     * May be {@code null} for system-level events.
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ReportType targetType;

    /**
     * Primary key of the entity the action targets.
     * Interpretation depends on {@link #targetType}.
     */
    private Long targetId;

    /**
     * Optional free-text details (resolution notes, system messages, etc.).
     */
    @Column(length = 2000)
    private String details;

    @Column(nullable = false, updatable = false)
    private Instant performedAt;

    @PrePersist
    void onCreate() {
        performedAt = Instant.now();
    }
}
