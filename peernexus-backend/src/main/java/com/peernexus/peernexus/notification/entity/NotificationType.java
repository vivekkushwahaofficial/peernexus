package com.peernexus.peernexus.notification.entity;

public enum NotificationType {
    // Connection events
    CONNECTION_REQUEST,
    CONNECTION_ACCEPTED,
    CONNECTION_REJECTED,

    // Answer events
    NEW_ANSWER,
    NEW_UPVOTE,
    NEW_DOWNVOTE,

    // Group events
    GROUP_JOIN_REQUEST,
    GROUP_JOIN_APPROVED,
    GROUP_JOIN_REJECTED,
    GROUP_OWNERSHIP_TRANSFERRED,
    GROUP_KICKED,

    // Admin moderation events
    ADMIN_WARNING,
    ADMIN_SUSPENSION,
    ADMIN_BAN
}
