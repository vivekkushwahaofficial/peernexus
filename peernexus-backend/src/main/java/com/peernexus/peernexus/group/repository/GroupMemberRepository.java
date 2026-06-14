package com.peernexus.peernexus.group.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.peernexus.peernexus.group.entity.GroupMember;
import com.peernexus.peernexus.group.entity.GroupRole;

/**
 * Data access layer for {@link GroupMember}.
 */
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    /**
     * Finds the membership record for a specific user in a specific group.
     *
     * @param groupId the group's primary key
     * @param userId  the user's primary key
     * @return the membership if the user is a member
     */
    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);

    /**
     * Checks whether a user is already a member of a group.
     *
     * @param groupId the group's primary key
     * @param userId  the user's primary key
     * @return {@code true} if a membership record exists
     */
    boolean existsByGroupIdAndUserId(Long groupId, Long userId);

    @Query(value = "select gm from GroupMember gm join fetch gm.user where gm.group.id = :groupId order by gm.joinedAt asc",
           countQuery = "select count(gm) from GroupMember gm where gm.group.id = :groupId")
    Page<GroupMember> findByGroupIdOrderByJoinedAtAsc(@Param("groupId") Long groupId, Pageable pageable);

    /**
     * Returns all members of a group with a specific role.
     *
     * @param groupId the group's primary key
     * @param role    the target role
     * @return list of membership records matching the role
     */
    List<GroupMember> findByGroupIdAndRole(Long groupId, GroupRole role);

    /**
     * Finds the OWNER membership record for a group.
     *
     * @param groupId the group's primary key
     * @return the owner's membership record (always present by invariant)
     */
    @Query("select gm from GroupMember gm where gm.group.id = :groupId and gm.role = 'OWNER'")
    Optional<GroupMember> findOwner(@Param("groupId") Long groupId);

    /**
     * Counts the total number of active members in a group.
     *
     * @param groupId the group's primary key
     * @return total member count
     */
    long countByGroupId(Long groupId);

    /**
     * Bulk-deletes all membership records for a group (used during group deletion).
     *
     * @param groupId the group's primary key
     */
    @Modifying
    @Query("DELETE FROM GroupMember m WHERE m.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") Long groupId);
}
