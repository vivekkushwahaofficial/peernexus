package com.peernexus.peernexus.groupchat.dto;

import java.time.Instant;

import com.peernexus.peernexus.chat.entity.MessageType;

import lombok.Builder;

/**
 * Outbound representation of a persisted {@link com.peernexus.peernexus.groupchat.entity.GroupMessage}.
 *
 * <p>Delivered to group subscribers via STOMP {@code /topic/group/{groupId}/messages}
 * and also returned by the REST history endpoint.
 *
 * @param id           message primary key
 * @param groupId      owning study group
 * @param senderId     sender's user ID
 * @param senderName   sender's display name
 * @param content      text body or Cloudinary URL (null if soft-deleted)
 * @param type         TEXT | IMAGE | FILE
 * @param fileName     original filename (FILE messages only)
 * @param sentAt       timestamp the message was persisted
 * @param deleted      whether the message has been soft-deleted
 * @param readCount    number of members (excluding sender) who have read this message
 */
@Builder
public record GroupMessageResponse(
        Long id,
        Long groupId,
        Long senderId,
        String senderName,
        String content,
        MessageType type,
        String fileName,
        Instant sentAt,
        boolean deleted,
        long readCount
) {}
