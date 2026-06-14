package com.peernexus.peernexus.notification.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.peernexus.peernexus.exception.ResourceNotFoundException;
import com.peernexus.peernexus.exception.UnauthorizedException;
import com.peernexus.peernexus.notification.dto.NotificationResponse;
import com.peernexus.peernexus.notification.entity.Notification;
import com.peernexus.peernexus.notification.entity.NotificationType;
import com.peernexus.peernexus.notification.repository.NotificationRepository;
import com.peernexus.peernexus.notification.service.NotificationService;
import com.peernexus.peernexus.user.entity.User;
import com.peernexus.peernexus.user.repository.UserRepository;
import com.peernexus.peernexus.user.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Notification service implementation.
 *
 * <p>Every new notification is:
 * <ol>
 *   <li>Persisted to the {@code notifications} table.</li>
 *   <li>Pushed in real-time to the recipient's personal STOMP queue
 *       ({@code /user/queue/notifications}) so the UI badge updates
 *       instantly without a page refresh.</li>
 * </ol>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public NotificationResponse createNotification(
            User recipient,
            User actor,
            NotificationType type,
            String message,
            String referenceType,
            Long referenceId
    ) {
        // Avoid self-notifications
        if (recipient.getId().equals(actor != null ? actor.getId() : null)) {
            log.debug("Skipping self-notification for user {}", recipient.getId());
            return null;
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .message(message)
                .read(false)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();
        NotificationResponse response = toResponse(notificationRepository.save(notification));

        // Real-time push to the recipient's personal queue
        try {
            messagingTemplate.convertAndSendToUser(
                    recipient.getEmail(),
                    "/queue/notifications",
                    response
            );
            log.debug("Real-time notification pushed to user {} ({})", recipient.getId(), type);
        } catch (Exception ex) {
            // Non-fatal: user may not be connected via WebSocket
            log.debug("Could not push real-time notification to user {}: {}", recipient.getId(), ex.getMessage());
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(Pageable pageable) {
        User user = resolveCurrentUser();
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public NotificationResponse markRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        User user = resolveCurrentUser();
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new UnauthorizedException("Access denied");
        }
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    /**
     * Marks all unread notifications for the current user as read.
     *
     * <p><strong>Optimization:</strong> replaced the previous pattern of
     * fetching every notification and saving them one-by-one in a loop
     * ({@code N} round-trips) with a single bulk
     * {@code UPDATE notifications SET is_read = TRUE WHERE recipient_id = ? AND is_read = FALSE}
     * statement via {@link NotificationRepository#markAllReadByRecipientId(Long)}.
     */
    @Override
    @Transactional
    public void markAllRead() {
        User user = resolveCurrentUser();
        notificationRepository.markAllReadByRecipientId(user.getId());
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .message(notification.getMessage())
                .read(notification.isRead())
                .referenceType(notification.getReferenceType())
                .referenceId(notification.getReferenceId())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    private User resolveCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl details) {
            return userRepository.findById(details.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        throw new UnauthorizedException("Unauthorized");
    }
}
