package com.peernexus.peernexus.group.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.peernexus.peernexus.group.entity.StudyGroup;

/**
 * Data access layer for {@link StudyGroup}.
 */
public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {

    /**
     * Returns all groups the given user is a member of (any role), ordered by
     * most-recently created.
     *
     * @param userId   the user's primary key
     * @param pageable pagination params
     * @return page of groups the user belongs to
     */
    @Query("""
            select g from StudyGroup g
             join GroupMember gm on gm.group = g
            where gm.user.id = :userId
            order by g.createdAt desc
            """)
    Page<StudyGroup> findByMember(@Param("userId") Long userId, Pageable pageable);

    /**
     * Full-text-style search on name and topic (case-insensitive LIKE).
     * Searches all public and private groups.
     *
     * @param keyword  search term
     * @param pageable pagination params
     * @return page of matching groups
     */
    @Query("""
            select g from StudyGroup g
            where lower(g.name)  like lower(concat('%', :keyword, '%'))
               or lower(g.topic) like lower(concat('%', :keyword, '%'))
            order by g.memberCount desc
            """)
    Page<StudyGroup> search(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Lists all groups ordered by member count (discover / trending page).
     */
    @Query("select g from StudyGroup g order by g.memberCount desc")
    Page<StudyGroup> findAllOrderByMemberCount(Pageable pageable);
}
