package com.peernexus.peernexus.groupchat.dto;

/**
 * Typing indicator event for group chat.
 *
 * <p>Sent by the client to {@code /app/group.typing} and forwarded to all
 * other members via {@code /topic/group/{groupId}/typing}.
 *
 * @param groupId  the study group where typing is occurring
 * @param senderId the user who is typing (or stopped typing)
 * @param typing   {@code true} = started typing; {@code false} = stopped
 */
public record GroupTypingEvent(
        Long groupId,
        Long senderId,
        boolean typing
) {}
