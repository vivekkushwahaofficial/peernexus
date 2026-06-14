package com.peernexus.peernexus.groupchat.dto;

import java.time.Instant;

/**
 * Broadcast payload sent to {@code /topic/group.{groupId}.read} when one or
 * more messages in the group have been marked as read by a member.
 *
 * @param groupId   the study group where messages were read
 * @param readerId  the user who marked messages as read
 * @param readAt    timestamp of the read action
 * @param readCount number of messages that were newly marked as read
 */
public record GroupReadReceiptEvent(
        Long groupId,
        Long readerId,
        Instant readAt,
        int readCount
) {}
