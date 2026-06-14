package com.peernexus.peernexus.group.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents a study group on PeerNexus.
 *
 * <p>Every group has exactly one {@link GroupRole#OWNER} (tracked via
 * {@link GroupMember}) and may have zero or more ADMINs and MEMBERs.
 *
 * <p>The group image URL is a Cloudinary HTTPS URL; no binary data is stored
 * in MySQL.  The URL can be updated via the Cloudinary upload API.
 *
 * <p>When {@code isPrivate} is {@code true} users must submit a
 * {@link GroupJoinRequest} and wait for an OWNER or ADMIN to approve it.
 * When {@code false} the group is open and users join instantly.
 */
@Entity
@Table(name = "study_groups")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Display name of the group (1–100 characters). */
    @Column(nullable = false, length = 100)
    private String name;

    /** Optional longer description shown on the group detail page. */
    @Column(length = 1000)
    private String description;

    /**
     * Cloudinary HTTPS URL for the group's cover / avatar image.
     * {@code null} when no image has been uploaded yet.
     */
    @Column(length = 500)
    private String imageUrl;

    /**
     * Cloudinary public_id of the group image.
     * Stored alongside {@code imageUrl} to allow future deletion via the
     * Cloudinary API without reverse-engineering the URL.
     */
    @Column(length = 300)
    private String imagePublicId;

    /**
     * Topic or subject area for the group (e.g. "Java", "Machine Learning").
     * Used for discovery / search.
     */
    @Column(length = 100)
    private String topic;

    /**
     * {@code true} = users must request to join (approval workflow).
     * {@code false} = anyone can join instantly.
     */
    @Default
    @Column(nullable = false)
    private boolean isPrivate = false;

    /** Current number of active members (denormalized for fast display). */
    @Default
    @Column(nullable = false)
    private int memberCount = 0;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
