package com.peernexus.peernexus.notification.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.peernexus.peernexus.notification.dto.NotificationResponse;
import com.peernexus.peernexus.notification.entity.NotificationType;
import com.peernexus.peernexus.user.entity.User;

public interface NotificationService {

    NotificationResponse createNotification(User recipient, User actor, NotificationType type, String message, String referenceType, Long referenceId);

    Page<NotificationResponse> getMyNotifications(Pageable pageable);

    NotificationResponse markRead(Long id);

    void markAllRead();
}
