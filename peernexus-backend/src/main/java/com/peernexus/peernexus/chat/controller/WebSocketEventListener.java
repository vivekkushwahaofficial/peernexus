package com.peernexus.peernexus.chat.controller;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import com.peernexus.peernexus.chat.dto.OnlineStatusEvent;
import com.peernexus.peernexus.chat.service.ChatService;
import com.peernexus.peernexus.chat.service.OnlineStatusService;
import com.peernexus.peernexus.user.repository.UserRepository;
import com.peernexus.peernexus.user.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Listens to Spring WebSocket session lifecycle events to maintain real-time
 * online-presence state and broadcast status changes.
 *
 * <h2>Events</h2>
 * <ul>
 *   <li>{@link SessionConnectedEvent} – fired after a STOMP CONNECT is fully established.</li>
 *   <li>{@link SessionDisconnectEvent} – fired when a client WebSocket session closes (normal or abnormal).</li>
 * </ul>
 *
 * <h2>Broadcast destination</h2>
 * Status changes are pushed to {@code /topic/status/{userId}} so any
 * subscriber (e.g. a connected peer) sees real-time presence updates.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final OnlineStatusService onlineStatusService;
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    /**
     * Marks the user as online and broadcasts the status to
     * {@code /topic/status/{userId}}.
     */
    @EventListener
    public void handleConnect(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Long userId = resolveUserId(accessor);
        if (userId == null) return;

        onlineStatusService.markOnline(userId);
        broadcast(userId, true);
        
        try {
            chatService.markUndeliveredAsDelivered(userId);
        } catch (Exception e) {
            log.error("Failed to mark undelivered messages as delivered", e);
        }
        
        log.debug("User {} connected (WebSocket)", userId);
    }

    /**
     * Marks the user as offline and broadcasts the status to
     * {@code /topic/status/{userId}}.
     */
    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Long userId = resolveUserId(accessor);
        if (userId == null) return;

        onlineStatusService.markOffline(userId);
        broadcast(userId, false);
        log.debug("User {} disconnected (WebSocket)", userId);
    }

    // ─────────────────────────────────────────────────────────────────────────

    private void broadcast(Long userId, boolean online) {
        messagingTemplate.convertAndSend(
                "/topic/status/" + userId,
                new OnlineStatusEvent(userId, online)
        );
    }

    /**
     * Extracts the user ID from the STOMP session principal.
     * Returns {@code null} if the session is unauthenticated (e.g. during
     * SockJS /info pre-flight requests).
     */
    private Long resolveUserId(StompHeaderAccessor accessor) {
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken authToken) {
            Object details = authToken.getPrincipal();
            if (details instanceof UserDetailsImpl userDetails) {
                return userDetails.getId();
            }
        }
        if (accessor.getUser() instanceof UserDetailsImpl details) {
            return details.getId();
        }
        // Fallback: look up by email if principal is a plain String
        if (accessor.getUser() != null) {
            String email = accessor.getUser().getName();
            return userRepository.findByEmail(email)
                    .map(u -> u.getId())
                    .orElse(null);
        }
        return null;
    }
}
