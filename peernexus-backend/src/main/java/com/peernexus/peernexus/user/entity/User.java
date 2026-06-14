package com.peernexus.peernexus.user.entity;

import java.time.Instant;

import com.peernexus.peernexus.reputation.entity.ReputationLevel;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Builder.Default
    @Column(nullable = false)
    private boolean verified = true;

    @Column(nullable = false)
    private boolean enabled;

    @Column(length = 500)
    private String profilePicture;

    @Column(length = 500)
    private String bio;

    @Column(length = 500)
    private String skills;

    @Column(length = 500)
    private String interests;

    @Default
    @Column(nullable = false)
    private int reputationPoints = 0;

    @Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReputationLevel reputationLevel = ReputationLevel.BEGINNER;

    @Builder.Default
    @Column(nullable = false)
    private boolean online = false;

    private java.time.LocalDateTime lastSeen;

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
