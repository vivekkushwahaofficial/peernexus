package com.peernexus.peernexus.admin.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.peernexus.peernexus.admin.entity.Report;
import com.peernexus.peernexus.admin.entity.ReportStatus;
import com.peernexus.peernexus.admin.entity.ReportType;

/**
 * Data access layer for {@link Report}.
 */
public interface ReportRepository extends JpaRepository<Report, Long> {

    /**
     * Returns all reports with the given status (paginated), newest first.
     *
     * @param status   the lifecycle status to filter by
     * @param pageable pagination params
     * @return page of matching reports
     */
    Page<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status, Pageable pageable);

    /**
     * Returns all reports of the given type (paginated), newest first.
     *
     * @param type     the report type to filter by
     * @param pageable pagination params
     * @return page of matching reports
     */
    Page<Report> findByTypeOrderByCreatedAtDesc(ReportType type, Pageable pageable);

    /**
     * Returns all reports submitted by a specific user (paginated).
     *
     * @param reporterId the reporter's user ID
     * @param pageable   pagination params
     * @return page of reports by this user
     */
    Page<Report> findByReporterIdOrderByCreatedAtDesc(Long reporterId, Pageable pageable);

    /**
     * Returns all reports targeting a specific entity of a given type.
     *
     * @param type     the type of content reported
     * @param targetId the primary key of the reported entity
     * @return page of reports for this target
     */
    Page<Report> findByTypeAndTargetIdOrderByCreatedAtDesc(ReportType type, Long targetId, Pageable pageable);

    /**
     * Returns all reports (any status), newest first.
     *
     * @param pageable pagination params
     * @return all reports paged
     */
    Page<Report> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Counts reports by status — used for dashboard badge counts.
     *
     * @param status the status to count
     * @return count of reports with that status
     */
    long countByStatus(ReportStatus status);

    /**
     * Checks whether a user has already filed a report against the same target.
     *
     * @param reporterId the reporter's user ID
     * @param type       the report type
     * @param targetId   the target entity's primary key
     * @return {@code true} if a duplicate report exists
     */
    @Query("SELECT COUNT(r) > 0 FROM Report r " +
           "WHERE r.reporter.id = :reporterId " +
           "AND r.type = :type " +
           "AND r.targetId = :targetId " +
           "AND r.status IN ('OPEN', 'REVIEWING')")
    boolean existsOpenReport(
            @Param("reporterId") Long reporterId,
            @Param("type") ReportType type,
            @Param("targetId") Long targetId);
}
