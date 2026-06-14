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
 * Records a moderation enforcement action performed by an admin or moderator.
 *
 * <p>This entity is created whenever a moderator takes action on a {@link Report}
 * (or acts independently — e.g. proactive bans without a prior report).
 *
 * <p>The {@code targetUserId} always refers to the {@code users} table because
 * all enforcement actions are ultimately applied to a user account.  Content
 * removal ({@link ModerationActionType#DELETE_CONTENT}) stores the content
 * reference in {@code targetContentId} and {@code targetContentType}.
 */
@Entity
@Table(name = "moderation_actions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerationAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The admin or moderator who performed this action. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    /**
     * The user against whom the action is being taken.
     * For {@link ModerationActionType#DELETE_CONTENT} this is the content owner.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id", nullable = false)
    private User targetUser;

    /** The kind of action being applied. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ModerationActionType actionType;

    /**
     * Human-readable reason for the action.
     * Shown to the user in notification emails / in-app alerts.
     */
    @Column(nullable = false, length = 1000)
    private String reason;

    /**
     * For {@link ModerationActionType#SUSPEND}: the date/time the suspension ends.
     * {@code null} for other action types or indefinite suspensions.
     */
    private Instant suspendUntil;

    /**
     * For {@link ModerationActionType#DELETE_CONTENT}: the ID of the deleted entity.
     * {@code null} for user-targeted actions.
     */
    private Long targetContentId;

    /**
     * For {@link ModerationActionType#DELETE_CONTENT}: the type of the deleted content
     * (mirrors {@link ReportType} — e.g. DOUBT, ANSWER, MESSAGE, GROUP).
     * {@code null} for user-targeted actions.
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ReportType targetContentType;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
