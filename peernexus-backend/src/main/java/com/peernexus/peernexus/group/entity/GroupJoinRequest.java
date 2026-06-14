package com.peernexus.peernexus.group.entity;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Records a user's request to join a private {@link StudyGroup}.
 *
 * <p>The unique constraint on {@code (group_id, requester_id)} ensures a user
 * can only have one active (or decided) request per group.  If a previous
 * request was rejected the service must delete it before a new one is created.
 *
 * <p>The {@code reviewedBy} field is populated when an OWNER or ADMIN decides
 * on the request.
 */
@Entity
@Table(
        name = "group_join_requests",
        uniqueConstraints = @UniqueConstraint(columnNames = {"group_id", "requester_id"})
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupJoinRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private JoinRequestStatus status = JoinRequestStatus.PENDING;

    /** Optional message the requester includes with their join request. */
    @Column(length = 500)
    private String message;

    /** The OWNER or ADMIN who approved / rejected the request; null while pending. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    /** Timestamp the decision was made; null while pending. */
    private Instant reviewedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
