package com.peernexus.peernexus.chat.dto;

import java.time.Instant;

import com.peernexus.peernexus.chat.entity.MessageType;
import com.peernexus.peernexus.chat.entity.MessageStatus;

import lombok.Builder;

/**
 * Outbound representation of a persisted {@link com.peernexus.peernexus.chat.entity.Message}.
 *
 * <p>Delivered to subscribers via STOMP {@code /user/queue/messages} and
 * also returned by the REST history endpoint.
 *
 * @param id         message primary key
 * @param chatRoomId owning chat room
 * @param senderId   sender's user ID
 * @param senderName sender's display name
 * @param content    text body or Cloudinary URL
 * @param type       TEXT | IMAGE | FILE
 * @param fileName   original filename (FILE messages only)
 * @param readAt     timestamp the recipient read the message; null = unread
 * @param sentAt     timestamp the message was persisted
 * @param deleted    whether the message has been soft-deleted
 */
@Builder
public record MessageResponse(
        Long id,
        Long chatRoomId,
        Long senderId,
        String senderName,
        String senderProfilePicture,
        String content,
        MessageType type,
        String fileName,
        String fileUrl,
        Long fileSize,
        String mimeType,
        MessageStatus status,
        java.util.List<MessageReactionResponse> reactions,
        boolean edited,
        boolean pinned,
        Instant readAt,
        Instant sentAt,
        boolean deleted
) {}
