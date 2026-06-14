package com.peernexus.peernexus.chat.dto;

import java.time.Instant;

import com.peernexus.peernexus.chat.entity.MessageType;

import lombok.Builder;

/**
 * Represents a chat room as seen by the authenticated user.
 *
 * <p>Returned by {@code GET /api/chat/rooms} to power the inbox / conversation
 * list.  Includes last-message preview fields so the client does not need to
 * load full history for each room.
 *
 * @param id                  chat room primary key
 * @param otherUserId         the other participant's user ID
 * @param otherUserName       the other participant's display name
 * @param otherUserPicture    the other participant's profile picture URL
 * @param otherUserOnline     whether the other participant is currently online
 * @param lastMessageContent  body / URL of the most recent message
 * @param lastMessageType     type of the most recent message
 * @param lastMessageAt       timestamp of the most recent message
 * @param lastMessageSenderId ID of the sender of the most recent message
 * @param unreadCount         number of unread messages in this room for the caller
 */
@Builder
public record ChatRoomResponse(
        Long roomId,
        UserChatResponse otherUser,
        String lastMessageContent,
        MessageType lastMessageType,
        Instant lastMessageAt,
        Long lastMessageSenderId,
        long unreadCount
) {}
