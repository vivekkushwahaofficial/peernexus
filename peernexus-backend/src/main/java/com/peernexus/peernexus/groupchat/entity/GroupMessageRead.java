package com.peernexus.peernexus.groupchat.entity;

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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Per-user read receipt for a {@link GroupMessage}.
 *
 * <p>Unlike private chat (where a single {@code readAt} timestamp on the message
 * itself is sufficient), group chat requires a separate join table because every
 * member of the group independently reads the same message.
 *
 * <p>A record is inserted when a member explicitly marks the message (or all
 * messages in the channel) as read.  The unique constraint prevents duplicate
 * receipts for the same (message, reader) pair.
 */
@Entity
@Table(
        name = "group_message_reads",
        uniqueConstraints = @UniqueConstraint(columnNames = {"message_id", "reader_id"})
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMessageRead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private GroupMessage message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reader_id", nullable = false)
    private User reader;

    @Column(nullable = false)
    private Instant readAt;
}
