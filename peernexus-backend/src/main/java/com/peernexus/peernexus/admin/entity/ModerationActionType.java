package com.peernexus.peernexus.admin.entity;

/**
 * The kind of moderation action taken against a reported user or content.
 *
 * <ul>
 *   <li>{@code WARNING}        – formal warning issued to the user</li>
 *   <li>{@code SUSPEND}        – temporary account suspension</li>
 *   <li>{@code BAN}            – permanent account ban</li>
 *   <li>{@code DELETE_CONTENT} – reported content was removed</li>
 * </ul>
 */
public enum ModerationActionType {
    WARNING,
    SUSPEND,
    BAN,
    DELETE_CONTENT
}
