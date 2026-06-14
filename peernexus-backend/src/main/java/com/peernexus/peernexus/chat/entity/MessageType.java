package com.peernexus.peernexus.chat.entity;

/**
 * Discriminates the kind of content carried by a {@link Message}.
 *
 * <ul>
 *   <li>{@code TEXT}  – plain-text body</li>
 *   <li>{@code IMAGE} – Cloudinary image URL stored in {@code content}</li>
 *   <li>{@code FILE}  – Cloudinary file URL stored in {@code content}</li>
 * </ul>
 */
public enum MessageType {
    TEXT,
    IMAGE,
    FILE
}
