package com.peernexus.peernexus.admin.entity;

/**
 * Lifecycle status of a {@link Report}.
 *
 * <ul>
 *   <li>{@code OPEN}      – newly submitted, awaiting review</li>
 *   <li>{@code REVIEWING} – an admin/moderator has picked it up</li>
 *   <li>{@code RESOLVED}  – action was taken (see linked {@link ModerationAction})</li>
 *   <li>{@code REJECTED}  – report was dismissed as invalid</li>
 * </ul>
 */
public enum ReportStatus {
    OPEN,
    REVIEWING,
    RESOLVED,
    REJECTED
}
