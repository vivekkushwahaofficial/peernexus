package com.peernexus.peernexus.groupchat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.peernexus.peernexus.groupchat.entity.GroupMessage;
import com.peernexus.peernexus.groupchat.entity.GroupMessageRead;

/**
 * Data access layer for {@link GroupMessageRead}.
 *
 * <p>Each record marks that a specific user has read a specific group message.
 * A unique constraint on {@code (message_id, reader_id)} prevents duplicates.
 */
public interface GroupMessageReadRepository extends JpaRepository<GroupMessageRead, Long> {

    /**
     * Checks whether the given user has already read a specific message.
     *
     * @param messageId the message primary key
     * @param readerId  the reader's user primary key
     * @return {@code true} if a read receipt already exists
     */
    boolean existsByMessageIdAndReaderId(Long messageId, Long readerId);

    /**
     * Finds the read receipt for a (message, reader) pair.
     *
     * @param messageId the message primary key
     * @param readerId  the reader's user primary key
     * @return the receipt if it exists
     */
    Optional<GroupMessageRead> findByMessageIdAndReaderId(Long messageId, Long readerId);

    /**
     * Returns all read receipts for a single message (used to compute readCount).
     *
     * @param messageId the message primary key
     * @return list of read receipts
     */
    List<GroupMessageRead> findByMessageId(Long messageId);

    /**
     * Counts how many distinct users have read the given message.
     *
     * @param messageId the message primary key
     * @return reader count
     */
    long countByMessageId(Long messageId);

    /**
     * Returns the IDs of all messages in a group that the given user has not read,
     * excluding messages sent by that user themselves.
     *
     * @param groupId  the study group primary key
     * @param readerId the reader's user primary key
     * @return list of unread message entities
     */
    @Query("""
            SELECT m FROM GroupMessage m
            WHERE m.group.id = :groupId
              AND m.sender.id <> :readerId
              AND m.deleted = false
              AND NOT EXISTS (
                  SELECT 1 FROM GroupMessageRead r
                  WHERE r.message = m AND r.reader.id = :readerId
              )
            """)
    List<GroupMessage> findUnreadMessages(
            @Param("groupId") Long groupId,
            @Param("readerId") Long readerId);

    /**
     * Deletes all read receipts for a message (used during cascade delete tests).
     *
     * @param message the parent message
     */
    @Modifying
    @Query("DELETE FROM GroupMessageRead r WHERE r.message = :message")
    void deleteByMessage(@Param("message") GroupMessage message);

    /**
     * Bulk-deletes all read receipts for every message in the given group.
     * Must be called before deleting the group's {@link GroupMessage} rows so
     * that FK constraints are satisfied.
     *
     * @param groupId the study group primary key
     */
    @Modifying
    @Query("DELETE FROM GroupMessageRead r WHERE r.message.group.id = :groupId")
    void deleteAllByGroupId(@Param("groupId") Long groupId);
}
