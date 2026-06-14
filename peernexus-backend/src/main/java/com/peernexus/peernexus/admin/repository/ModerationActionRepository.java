package com.peernexus.peernexus.admin.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.peernexus.peernexus.admin.entity.ModerationAction;
import com.peernexus.peernexus.admin.entity.ModerationActionType;

/**
 * Data access layer for {@link ModerationAction}.
 */
public interface ModerationActionRepository extends JpaRepository<ModerationAction, Long> {

    /**
     * Returns all moderation actions targeting a specific user, newest first.
     *
     * @param targetUserId the user's primary key
     * @param pageable     pagination params
     * @return page of actions against this user
     */
    Page<ModerationAction> findByTargetUserIdOrderByCreatedAtDesc(Long targetUserId, Pageable pageable);

    /**
     * Returns all moderation actions performed by a specific actor (admin/moderator).
     *
     * @param actorId  the actor's user primary key
     * @param pageable pagination params
     * @return page of actions by this actor
     */
    Page<ModerationAction> findByActorIdOrderByCreatedAtDesc(Long actorId, Pageable pageable);

    /**
     * Returns all moderation actions of a specific type, newest first.
     *
     * @param actionType the type of moderation action
     * @param pageable   pagination params
     * @return page of actions of this type
     */
    Page<ModerationAction> findByActionTypeOrderByCreatedAtDesc(ModerationActionType actionType, Pageable pageable);

    /**
     * Returns all moderation actions (any type/target), newest first.
     *
     * @param pageable pagination params
     * @return all actions paged
     */
    Page<ModerationAction> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Checks whether a user currently has an active BAN or SUSPEND record.
     *
     * @param targetUserId the user's primary key
     * @param actionType   the action type to check
     * @return {@code true} if such a record exists
     */
    boolean existsByTargetUserIdAndActionType(Long targetUserId, ModerationActionType actionType);
}
