package com.peernexus.peernexus.chat.dto;

/**
 * Broadcast to all subscribers of {@code /topic/status/{userId}} when a user's
 * online presence changes.
 *
 * @param userId the user whose status changed
 * @param online {@code true} = user connected, {@code false} = user disconnected
 */
public record OnlineStatusEvent(
        Long userId,
        boolean online
) {}
