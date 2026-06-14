package com.peernexus.peernexus.group.entity;

/**
 * Lifecycle state of a {@link GroupJoinRequest}.
 *
 * <ul>
 *   <li>{@code PENDING}  – waiting for an OWNER or ADMIN to decide</li>
 *   <li>{@code APPROVED} – request accepted; member added to the group</li>
 *   <li>{@code REJECTED} – request denied</li>
 * </ul>
 */
public enum JoinRequestStatus {
    PENDING,
    APPROVED,
    REJECTED
}
