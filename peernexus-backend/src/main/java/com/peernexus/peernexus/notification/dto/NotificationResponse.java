package com.peernexus.peernexus.notification.dto;

import java.time.Instant;

import com.peernexus.peernexus.notification.entity.NotificationType;

import lombok.Builder;

@Builder
public record NotificationResponse(
        Long id,
        NotificationType type,
        String message,
        boolean read,
        String referenceType,
        Long referenceId,
        Instant createdAt
        ) {

}
