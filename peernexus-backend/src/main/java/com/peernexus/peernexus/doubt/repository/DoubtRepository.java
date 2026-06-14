package com.peernexus.peernexus.doubt.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.peernexus.peernexus.doubt.entity.Doubt;

public interface DoubtRepository extends JpaRepository<Doubt, Long> {

    // ── Feed queries – JOIN FETCH author + category to eliminate N+1 ──────────

    /**
     * Returns all doubts, eagerly fetching author and category to avoid N+1
     * lazy-load queries during mapping. Tags and images remain lazy (they are
     * collections that trigger separate SELECT per row if fetched via join,
     * causing a Cartesian explosion — loaded individually only when accessed).
     */
    @Query("""
            select d from Doubt d
            join fetch d.author
            join fetch d.category
            """)
    Page<Doubt> findAllWithAuthorAndCategory(Pageable pageable);

    /**
     * Search by title or content, eagerly fetching author and category.
     */
    @Query("""
            select d from Doubt d
            join fetch d.author
            join fetch d.category
            where lower(d.title) like lower(concat('%', :query, '%'))
               or lower(d.content) like lower(concat('%', :query, '%'))
            """)
    Page<Doubt> search(@Param("query") String query, Pageable pageable);

    /**
     * Filter by category ID, eagerly fetching author and category.
     */
    @Query("""
            select d from Doubt d
            join fetch d.author
            join fetch d.category
            where d.category.id = :categoryId
            """)
    Page<Doubt> findByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);
}
