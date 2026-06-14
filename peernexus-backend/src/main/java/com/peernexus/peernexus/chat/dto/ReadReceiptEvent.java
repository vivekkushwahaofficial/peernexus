package com.peernexus.peernexus.chat.dto;

import java.time.Instant;

/**
 * Delivered to the sender's {@code /user/queue/read-receipt} queue when the
 * recipient calls {@code POST /api/chat/rooms/{roomId}/read} or sends a
 * {@code /app/chat.read} STOMP frame.
 *
 * @param chatRoomId the room in which messages were read
 * @param readerId   the user who read the messages
 * @param readAt     the timestamp at which the read event occurred
 */
public record ReadReceiptEvent(
        Long chatRoomId,
        Long readerId,
        Instant readAt
) {}
