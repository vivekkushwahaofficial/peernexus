package com.peernexus.peernexus.chat.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.peernexus.peernexus.chat.entity.Message;

/**
 * Data access layer for {@link Message}.
 */
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Returns the paginated message history for a room, newest first.
     * Soft-deleted messages are excluded.
     *
     * <p>Eagerly fetches the {@code sender} association via JOIN FETCH to
     * avoid N+1 lazy-load queries when mapping each message to a DTO.
     *
     * @param chatRoomId the room's primary key
     * @param pageable   pagination (recommend page size 30–50)
     * @return a page of non-deleted messages with sender loaded
     */
    @Query("""
            select m from Message m
            join fetch m.sender
             where m.chatRoom.id = :chatRoomId
               and m.deleted = false
               and m.id not in (select udm.message.id from UserDeletedMessage udm where udm.user.id = :userId)
             order by m.sentAt desc
            """)
    Page<Message> findByChatRoomIdForUser(
            @Param("chatRoomId") Long chatRoomId,
            @Param("userId") Long userId,
            Pageable pageable
    );

    @Query("""
            select m.chatRoom.id as roomId, count(m) as cnt from Message m
             where m.chatRoom.id in :roomIds
               and m.sender.id  <> :userId
               and m.readAt is null
               and m.deleted = false
               and m.id not in (select udm.message.id from UserDeletedMessage udm where udm.user.id = :userId)
             group by m.chatRoom.id
            """)
    List<UnreadCountProjection> countUnreadGroupedByRoom(
            @Param("roomIds") List<Long> roomIds,
            @Param("userId") Long userId
    );

    @Query("""
            select m from Message m
            join fetch m.sender
            join m.chatRoom r
             where (r.user1.id = :userId or r.user2.id = :userId)
               and (:roomId is null or r.id = :roomId)
               and (:senderId is null or m.sender.id = :senderId)
               and (:query is null or lower(m.content) like lower(concat('%', :query, '%')))
               and m.deleted = false
               and m.id not in (select udm.message.id from UserDeletedMessage udm where udm.user.id = :userId)
             order by m.sentAt desc
            """)
    List<Message> searchMessages(
            @Param("userId") Long userId,
            @Param("roomId") Long roomId,
            @Param("senderId") Long senderId,
            @Param("query") String query
    );

    @Modifying
    @Query("""
            update Message m
               set m.readAt = :readAt, m.status = 'READ'
             where m.chatRoom.id = :chatRoomId
               and m.sender.id  <> :readerId
               and m.readAt is null
            """)
    int markAllRead(
            @Param("chatRoomId") Long chatRoomId,
            @Param("readerId") Long readerId,
            @Param("readAt") Instant readAt
    );

    @Modifying
    @Query("""
            update Message m
               set m.status = 'DELIVERED'
             where m.chatRoom.id in (
                select r.id from ChatRoom r where r.user1.id = :userId or r.user2.id = :userId
             )
             and m.sender.id <> :userId
             and m.status = 'SENT'
            """)
    int markSentAsDelivered(
            @Param("userId") Long userId
    );

    @Query("""
            select m from Message m
            join fetch m.sender
             where m.chatRoom.id in (
                select r.id from ChatRoom r where r.user1.id = :userId or r.user2.id = :userId
             )
             and m.sender.id <> :userId
             and m.status = 'SENT'
            """)
    List<Message> findSentMessagesForRecipient(
            @Param("userId") Long userId
    );

    @Query("""
            select distinct m.sender.id from Message m
             where m.chatRoom.id = :chatRoomId
               and m.sender.id  <> :readerId
               and m.readAt is null
            """)
    List<Long> findUnreadSenderIds(
            @Param("chatRoomId") Long chatRoomId,
            @Param("readerId") Long readerId
    );
}
