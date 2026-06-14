package com.peernexus.peernexus.notification.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.peernexus.peernexus.notification.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Returns a page of notifications for the given recipient, newest first.
     * Uses the composite index {@code idx_notifications_recipient_created}.
     *
     * @param recipientId the target user's primary key
     * @param pageable    pagination params
     * @return page of notifications
     */
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    /**
     * Bulk-marks all unread notifications for a recipient as read in a
     * <em>single</em> UPDATE statement.
     *
     * <p>Replaces the previous pattern of fetching all notifications then
     * saving them one-by-one in a loop, which produced {@code N} extra round
     * trips to the database.
     *
     * @param recipientId the recipient whose notifications are marked read
     * @return number of rows updated
     */
    @Modifying
    @Query("""
            update Notification n
               set n.read = true
             where n.recipient.id = :recipientId
               and n.read = false
            """)
    int markAllReadByRecipientId(@Param("recipientId") Long recipientId);

    /**
     * Counts unread notifications for a recipient — used for badge count.
     *
     * @param recipientId the user whose unread count is requested
     * @return number of unread notifications
     */
    @Query("""
            select count(n) from Notification n
             where n.recipient.id = :recipientId
               and n.read = false
            """)
    long countUnreadByRecipientId(@Param("recipientId") Long recipientId);
}
