package com.peernexus.peernexus.chat.entity;

import java.time.Instant;

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
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A single chat message sent inside a {@link ChatRoom}.
 *
 * <p>For {@link MessageType#TEXT} messages, {@code content} holds the plain
 * text.  For {@link MessageType#IMAGE} and {@link MessageType#FILE} messages,
 * {@code content} holds the Cloudinary HTTPS URL returned by the upload API.
 * Binary data is never stored in MySQL.
 *
 * <p>Read-receipt tracking uses the {@code readAt} timestamp: {@code null}
 * means unread, non-null means the recipient has seen the message.
 */
@Entity
@Table(
        name = "messages",
        indexes = {
                @Index(name = "idx_messages_room_sent", columnList = "chat_room_id, sent_at DESC")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The room this message belongs to. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;

    /** The user who sent this message. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    /**
     * For TEXT messages: the message body.
     * For IMAGE / FILE messages: the Cloudinary secure URL.
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

    @Column(length = 500)
    private String fileUrl;

    private Long fileSize;

    @Column(length = 100)
    private String mimeType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MessageStatus status = MessageStatus.SENT;

    @Builder.Default
    @Column(nullable = false)
    private boolean edited = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean pinned = false;

    @Builder.Default
    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.BatchSize(size = 20)
    private java.util.List<MessageReaction> reactions = new java.util.ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<MessageEdit> edits = new java.util.ArrayList<>();

    /**
     * Timestamp when the recipient opened / read this message.
     * {@code null} = unread.
     */
    private Instant readAt;

    @Column(nullable = false, updatable = false)
    private Instant sentAt;

    @Default
    @Column(nullable = false)
    private boolean deleted = false;

    @PrePersist
    void onCreate() {
        sentAt = Instant.now();
    }
}
