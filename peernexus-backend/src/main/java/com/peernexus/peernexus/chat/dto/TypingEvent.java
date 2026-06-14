package com.peernexus.peernexus.chat.dto;

/**
 * Payload broadcast to the other participant when someone is typing.
 *
 * <p>Sent by the client to {@code /app/chat.typing} and forwarded by the
 * server to {@code /user/queue/typing} on the recipient.
 *
 * @param chatRoomId the room in which typing is occurring
 * @param senderId   the user who is (or stopped) typing
 * @param typing     {@code true} = started typing, {@code false} = stopped
 */
public record TypingEvent(
        Long chatRoomId,
        Long senderId,
        boolean typing
) {}
