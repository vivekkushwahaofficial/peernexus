package com.peernexus.peernexus.answer.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.peernexus.peernexus.answer.entity.Answer;
import com.peernexus.peernexus.answer.entity.VoteType;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

    // ── Feed queries ──────────────────────────────────────────────────────────

    /**
     * Returns paginated answers for a doubt, eagerly fetching the author
     * association to eliminate N+1 lazy-load queries during mapping.
     *
     * @param doubtId  the doubt's primary key
     * @param pageable pagination params (recommended size: 20)
     * @return page of answers, newest-first by default
     */
    @Query("""
            select a from Answer a
            join fetch a.author
            where a.doubt.id = :doubtId
            """)
    Page<Answer> findByDoubtId(@Param("doubtId") Long doubtId, Pageable pageable);

    // ── Vote aggregate ────────────────────────────────────────────────────────

    /**
     * Counts all UPVOTE and DOWNVOTE votes for a set of answer IDs in a
     * <em>single</em> query, returning one row per (answerId, voteType) pair.
     *
     * <p>This replaces the previous pattern of calling
     * {@code countByAnswerIdAndType} twice per answer in a loop, which produced
     * {@code 2 × N} extra queries when rendering a page of answers.
     *
     * @param answerIds the answer IDs to aggregate
     * @return list of {@code [answerId, voteType, count]} object arrays
     */
    @Query("""
            select v.answer.id, v.type, count(v)
            from Vote v
            where v.answer.id in :answerIds
            group by v.answer.id, v.type
            """)
    List<Object[]> countVotesByAnswerIds(@Param("answerIds") List<Long> answerIds);

    // ── Utility ───────────────────────────────────────────────────────────────

    /**
     * Finds all currently-accepted answers for a doubt. Used when flipping
     * the accepted flag — ensures only one answer is accepted at a time.
     *
     * @param doubtId the doubt's primary key
     * @return list of currently accepted answers (normally 0 or 1)
     */
    List<Answer> findByDoubtIdAndAcceptedTrue(Long doubtId);

    /**
     * Finds an answer by ID together with its author (fetch join).
     * Avoids a secondary lazy-load in single-answer get/update operations.
     */
    @Query("""
            select a from Answer a
            join fetch a.author
            where a.id = :id
            """)
    Optional<Answer> findByIdWithAuthor(@Param("id") Long id);
}
