package com.peernexus.peernexus.groupchat.repository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.peernexus.peernexus.groupchat.entity.GroupMessage;

/**
 * Data access layer for {@link GroupMessage}.
 *
 * <p>All queries operate on the {@code group_messages} table.  Soft-deleted
 * messages are included in history results so the UI can render a
 * "This message was deleted" placeholder.
 */
public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {

    /**
     * Returns all messages for a group (used for cascade delete — read receipts
     * must be removed before the messages themselves).
     *
     * @param groupId the study group primary key
     * @return list of all messages belonging to the group
     */
    @Query("SELECT m FROM GroupMessage m WHERE m.group.id = :groupId")
    List<GroupMessage> findAllByGroupId(@Param("groupId") Long groupId);

    /**
     * Bulk-deletes all messages belonging to the given group.
     * Call only after all {@code GroupMessageRead} rows for those messages have
     * already been deleted, to avoid FK constraint violations.
     *
     * @param groupId the study group primary key
     */
    @Modifying
    @Query("DELETE FROM GroupMessage m WHERE m.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") Long groupId);

    /**
     * Returns a paginated, newest-first message history for the given group.
     *
     * @param groupId  the study group primary key
     * @param pageable pagination params (recommended size: 30)
     * @return page of messages ordered by {@code sentAt} descending
     */
    @Query("SELECT m FROM GroupMessage m " +
           "JOIN FETCH m.sender " +
           "WHERE m.group.id = :groupId " +
           "ORDER BY m.sentAt DESC")
    Page<GroupMessage> findByGroupIdOrderBySentAtDesc(
            @Param("groupId") Long groupId,
            Pageable pageable);

    /**
     * Returns the most recent message in a group, used for last-message preview.
     *
     * @param groupId the study group primary key
     * @return list of at most one message (newest first)
     */
    @Query("SELECT m FROM GroupMessage m " +
           "JOIN FETCH m.sender " +
           "WHERE m.group.id = :groupId AND m.deleted = false " +
           "ORDER BY m.sentAt DESC")
    List<GroupMessage> findTopByGroupIdOrderBySentAtDesc(
            @Param("groupId") Long groupId,
            Pageable pageable);

    /**
     * Counts all messages in a group that the given user has NOT yet read.
     *
     * @param groupId the study group primary key
     * @param userId  the reader's user primary key
     * @return number of unread messages
     */
    @Query("""
            SELECT COUNT(m) FROM GroupMessage m
            WHERE m.group.id = :groupId
              AND m.sender.id <> :userId
              AND m.deleted = false
              AND NOT EXISTS (
                  SELECT 1 FROM GroupMessageRead r
                  WHERE r.message = m AND r.reader.id = :userId
              )
            """)
    long countUnread(@Param("groupId") Long groupId, @Param("userId") Long userId);

    /**
     * Aggregates read counts for a batch of message IDs in a <em>single</em>
     * query, returning one row per message ID.
     *
     * <p>Replaces the previous pattern of calling
     * {@code groupMessageReadRepository.countByMessageId(id)} once per message
     * inside {@code getHistory()}, which produced N extra queries per page.
     *
     * <p>Usage: call {@link #countReadsByMessageIds(List)} and convert the
     * result to a {@code Map<Long, Long>} keyed by message ID.
     *
     * @param messageIds the message IDs to aggregate
     * @return list of {@code [messageId, readCount]} object arrays
     */
    @Query("""
            SELECT r.message.id, COUNT(r)
            FROM GroupMessageRead r
            WHERE r.message.id IN :messageIds
            GROUP BY r.message.id
            """)
    List<Object[]> countReadsByMessageIds(@Param("messageIds") List<Long> messageIds);

    /**
     * Convenience default method that converts the raw {@link #countReadsByMessageIds}
     * result into a typed map.
     *
     * @param messageIds the message IDs to aggregate
     * @return map from message ID → read count (absent entries imply 0 reads)
     */
    default Map<Long, Long> readCountMapFor(List<Long> messageIds) {
        return countReadsByMessageIds(messageIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));
    }
}
