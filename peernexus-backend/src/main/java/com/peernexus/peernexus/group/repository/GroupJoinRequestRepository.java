package com.peernexus.peernexus.group.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.peernexus.peernexus.group.entity.GroupJoinRequest;
import com.peernexus.peernexus.group.entity.JoinRequestStatus;

/**
 * Data access layer for {@link GroupJoinRequest}.
 */
public interface GroupJoinRequestRepository extends JpaRepository<GroupJoinRequest, Long> {

    /**
     * Finds any existing join request (regardless of status) by the given user
     * for the given group. Used to prevent duplicate requests.
     *
     * @param groupId     the group's primary key
     * @param requesterId the applicant's user ID
     * @return the existing request if present
     */
    Optional<GroupJoinRequest> findByGroupIdAndRequesterId(Long groupId, Long requesterId);

    /**
     * Returns paginated join requests for a group filtered by status.
     * OWNER and ADMIN use this to review PENDING requests.
     *
     * @param groupId  the group's primary key
     * @param status   the status to filter on (typically PENDING)
     * @param pageable pagination params
     * @return page of join requests
     */
    Page<GroupJoinRequest> findByGroupIdAndStatusOrderByCreatedAtAsc(
            Long groupId,
            JoinRequestStatus status,
            Pageable pageable
    );

    /**
     * Returns all join requests submitted by a user (their application history).
     *
     * @param requesterId the user's primary key
     * @param pageable    pagination params
     * @return page of join requests made by this user
     */
    Page<GroupJoinRequest> findByRequesterIdOrderByCreatedAtDesc(Long requesterId, Pageable pageable);

    /**
     * Bulk-deletes all join requests for a group (used during group deletion).
     *
     * @param groupId the group's primary key
     */
    @Modifying
    @Query("DELETE FROM GroupJoinRequest r WHERE r.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") Long groupId);
}
