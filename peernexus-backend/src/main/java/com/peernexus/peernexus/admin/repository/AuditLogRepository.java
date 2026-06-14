package com.peernexus.peernexus.admin.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.peernexus.peernexus.admin.entity.AuditLog;
import com.peernexus.peernexus.admin.entity.ReportType;

/**
 * Data access layer for {@link AuditLog}.
 *
 * <p>All data in this table is append-only. No delete or update operations
 * are permitted through this repository.
 */
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Returns all audit log entries ordered by most-recent first.
     *
     * @param pageable pagination params
     * @return all log entries paged
     */
    Page<AuditLog> findAllByOrderByPerformedAtDesc(Pageable pageable);

    /**
     * Returns all actions performed by a specific admin/moderator.
     *
     * @param actorId  the actor's user primary key
     * @param pageable pagination params
     * @return log entries by this actor
     */
    Page<AuditLog> findByActorIdOrderByPerformedAtDesc(Long actorId, Pageable pageable);

    /**
     * Returns all audit entries targeting a specific action code
     * (e.g. all {@code USER_BANNED} events).
     *
     * @param action   the action code to filter by
     * @param pageable pagination params
     * @return log entries for this action
     */
    Page<AuditLog> findByActionOrderByPerformedAtDesc(String action, Pageable pageable);

    /**
     * Returns all audit entries related to a specific entity type.
     *
     * @param targetType the entity type (USER, DOUBT, ANSWER, etc.)
     * @param pageable   pagination params
     * @return log entries for this target type
     */
    Page<AuditLog> findByTargetTypeOrderByPerformedAtDesc(ReportType targetType, Pageable pageable);

    /**
     * Returns all audit entries for a specific entity instance
     * (identified by type + ID).
     *
     * @param targetType the entity type
     * @param targetId   the entity primary key
     * @param pageable   pagination params
     * @return log entries for this entity
     */
    Page<AuditLog> findByTargetTypeAndTargetIdOrderByPerformedAtDesc(
            ReportType targetType, Long targetId, Pageable pageable);
}
