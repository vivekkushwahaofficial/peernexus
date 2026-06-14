package com.peernexus.peernexus.chat.entity;

import java.time.Instant;

import com.peernexus.peernexus.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents a private chat room between exactly two users.
 *
 * <p>A room is created on-demand the first time two ACCEPTED-connected users
 * exchange a message.  The {@code (user1_id, user2_id)} pair has a unique
 * constraint; by convention {@code user1.id < user2.id} so duplicate rooms
 * cannot be created.
 *
 * <p>The entity stores a snapshot of the last message for efficient "inbox"
 * list rendering without a JOIN on {@code messages}.
 */
@Entity
@Table(
        name = "chat_rooms",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user1_id", "user2_id"})
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The participant whose ID is numerically smaller.
     * This ordering is enforced in service code before persistence.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    /**
     * The participant whose ID is numerically larger.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    // ── Last-message preview ──────────────────────────────────────────────────

    /** Snapshot of the most recent message body (or URL for media). */
    @Column(length = 500)
    private String lastMessageContent;

    /** When the most recent message was sent. */
    private Instant lastMessageAt;

    /** Sender of the most recent message. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_message_sender_id")
    private User lastMessageSender;

    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    @Column(length = 10)
    private MessageType lastMessageType;

    // ── Timestamps ────────────────────────────────────────────────────────────

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
