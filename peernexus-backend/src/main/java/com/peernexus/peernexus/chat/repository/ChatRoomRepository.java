package com.peernexus.peernexus.chat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.peernexus.peernexus.chat.entity.ChatRoom;

/**
 * Data access layer for {@link ChatRoom}.
 *
 * <p>Room lookup always orders the pair (smaller ID first) so that there is
 * exactly one canonical room for any two users.
 */
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    /**
     * Finds the room shared by two users regardless of which was {@code user1}
     * and which was {@code user2}.
     *
     * @param userA one participant's ID
     * @param userB the other participant's ID
     * @return the chat room if it exists
     */
    @Query("""
            select r from ChatRoom r
             where (r.user1.id = :userA and r.user2.id = :userB)
                or (r.user1.id = :userB and r.user2.id = :userA)
            """)
    Optional<ChatRoom> findByParticipants(
            @Param("userA") Long userA,
            @Param("userB") Long userB
    );

    /**
     * Finds a chat room by ID and eagerly fetches both participants (user1 and user2)
     * to prevent LazyInitializationException when accessing participant details.
     *
     * @param id the room ID
     * @return the chat room if found
     */
    @Query("""
            select r from ChatRoom r
            join fetch r.user1
            join fetch r.user2
            where r.id = :id
            """)
    Optional<ChatRoom> findByIdWithParticipants(@Param("id") Long id);

    /**
     * Returns all rooms the given user participates in, ordered by most-recent
     * activity first (for the inbox / conversation list).
     *
     * <p>Eagerly fetches {@code user1}, {@code user2}, and
     * {@code lastMessageSender} via JOIN FETCH to eliminate N+1 lazy-load
     * queries when the caller maps each room to a DTO.
     *
     * @param userId the authenticated user's ID
     * @return list of chat rooms sorted descending by {@code lastMessageAt}
     */
    @Query("""
            select r from ChatRoom r
            join fetch r.user1
            join fetch r.user2
            left join fetch r.lastMessageSender
             where r.user1.id = :userId or r.user2.id = :userId
             order by r.lastMessageAt desc nulls last
            """)
    List<ChatRoom> findByParticipant(@Param("userId") Long userId);
}
