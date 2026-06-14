package com.peernexus.peernexus.chat.repository;

/**
 * Projection mapping for optimized unread count aggregation.
 */
public interface UnreadCountProjection {
    Long getRoomId();
    Long getCnt();
}
