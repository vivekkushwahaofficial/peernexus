package com.peernexus.peernexus.group.entity;

/**
 * Defines the role a member holds within a {@link StudyGroup}.
 *
 * <ul>
 *   <li>{@code OWNER}  – creator; exactly one per group; can transfer ownership, delete the group</li>
 *   <li>{@code ADMIN}  – trusted moderator; can approve/reject join requests and remove members</li>
 *   <li>{@code MEMBER} – standard participant</li>
 * </ul>
 */
public enum GroupRole {
    OWNER,
    ADMIN,
    MEMBER
}
