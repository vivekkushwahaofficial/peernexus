package com.peernexus.peernexus.groupchat.entity;

import java.time.Instant;

import com.peernexus.peernexus.chat.entity.MessageType;
import com.peernexus.peernexus.group.entity.StudyGroup;
import com.peernexus.peernexus.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A single message posted inside a {@link StudyGroup} chat channel.
 *
 * <p>Reuses the {@link MessageType} enum from the private chat module:
 * <ul>
 *   <li>{@code TEXT}  – {@code content} holds the plain-text body</li>
 *   <li>{@code IMAGE} – {@code content} holds a Cloudinary HTTPS image URL</li>
 *   <li>{@code FILE}  – {@code content} holds a Cloudinary HTTPS file URL;
 *       {@code fileName} holds the original file name</li>
 * </ul>
 *
 * <p>Binary data is never stored in MySQL.
 *
 * <p>Read receipts are tracked in the {@link GroupMessageRead} join table rather
 * than a single timestamp, because any of the N group members can independently
 * read the same message.
 */
@Entity
@Table(
        name = "group_messages",
        indexes = {
                @Index(name = "idx_group_messages_group_sent", columnList = "group_id, sent_at DESC")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The study group this message belongs to. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    /** The member who posted this message. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    /**
     * For TEXT: the plain-text body.<br>
     * For IMAGE / FILE: the Cloudinary HTTPS URL.
     */
    @Column(nullable = false, length = 2000)
    private String content;

    /** Discriminates how {@code content} should be interpreted. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private MessageType type;

    /**
     * Original filename for FILE messages; {@code null} for TEXT / IMAGE.
     * Stored so the UI can display a meaningful download label.
     */
    @Column(length = 255)
    private String fileName;

    /** Soft-delete flag — deleted messages show as "This message was deleted". */
    @Default
    @Column(nullable = false)
    private boolean deleted = false;

    @Column(nullable = false, updatable = false)
    private Instant sentAt;

    @PrePersist
    void onCreate() {
        sentAt = Instant.now();
    }
}
