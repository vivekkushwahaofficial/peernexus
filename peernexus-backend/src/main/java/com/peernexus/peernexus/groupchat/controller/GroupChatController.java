package com.peernexus.peernexus.groupchat.controller;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.peernexus.peernexus.groupchat.dto.GroupMessageResponse;
import com.peernexus.peernexus.groupchat.dto.GroupReadReceiptEvent;
import com.peernexus.peernexus.groupchat.dto.GroupSendMessageRequest;
import com.peernexus.peernexus.groupchat.dto.GroupTypingEvent;
import com.peernexus.peernexus.groupchat.service.GroupChatService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * STOMP message handler for the real-time group chat module.
 *
 * <p>All methods are triggered by client STOMP {@code SEND} frames addressed
 * to the {@code /app/**} prefix.  Responses are pushed to the shared group
 * topic so every connected member receives the event.
 *
 * <h2>Destination map</h2>
 * <pre>
 * Client SEND  /app/group.send     → persists message  → /topic/group.{groupId}
 * Client SEND  /app/group.typing   → forwards event    → /topic/group.{groupId}.typing
 * Client SEND  /app/group.read     → marks as read     → /topic/group.{groupId}.read
 * </pre>
 *
 * <h2>Security</h2>
 * The authenticated principal is resolved from the JWT set during the STOMP
 * {@code CONNECT} handshake by {@link com.peernexus.peernexus.config.WebSocketSecurityConfig}.
 * Each service call re-validates group membership; non-members will receive an
 * error frame from the global STOMP exception handler.
 *
 * <h2>Cloudinary media</h2>
 * For IMAGE and FILE messages the client must upload the asset to Cloudinary
 * before sending the STOMP frame.  The {@code content} field of
 * {@link GroupSendMessageRequest} carries the Cloudinary HTTPS URL.
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class GroupChatController {

    private final GroupChatService        groupChatService;
    private final SimpMessagingTemplate   messagingTemplate;

    // ─────────────────────────────────────────────────────────────────────────
    // Send group message  →  /topic/group.{groupId}
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Handles a client {@code SEND} to {@code /app/group.send}.
     *
     * <ol>
     *   <li>Persists the message via {@link GroupChatService#sendMessage}.</li>
     *   <li>Broadcasts the confirmed response to all group subscribers.</li>
     * </ol>
     *
     * @param request   the inbound STOMP payload (deserialized from JSON)
     * @param principal the authenticated sender
     */
    @MessageMapping("/group.send")
    public void sendMessage(
            @Payload GroupSendMessageRequest request,
            Principal principal
    ) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        try {
            GroupMessageResponse response = groupChatService.sendMessage(request);

            String destination = "/topic/group." + request.groupId();
            messagingTemplate.convertAndSend(destination, response);

            log.debug("Group message {} broadcast to {}", response.id(), destination);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Typing indicator  →  /topic/group.{groupId}.typing
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Handles a client {@code SEND} to {@code /app/group.typing}.
     *
     * <p>Forwards the typing event to all other members subscribed to the
     * group typing topic.  No data is persisted.
     *
     * @param event     the typing indicator payload
     * @param principal the authenticated typer
     */
    @MessageMapping("/group.typing")
    public void handleTyping(
            @Payload GroupTypingEvent event,
            Principal principal
    ) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        try {
            GroupTypingEvent enriched = groupChatService.handleTyping(event);

            String destination = "/topic/group." + enriched.groupId() + ".typing";
            messagingTemplate.convertAndSend(destination, enriched);

            log.debug("Typing event from {} forwarded to {}", enriched.senderId(), destination);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Read receipts  →  /topic/group.{groupId}.read
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Handles a client {@code SEND} to {@code /app/group.read}.
     *
     * <p>Marks all unread messages in the group as read for the authenticated
     * user and broadcasts a read-receipt event to all group members so they
     * can update the "read by N" indicator in real time.
     *
     * <p>If there are no unread messages the broadcast is skipped silently.
     *
     * @param event     payload containing the {@code groupId} to mark as read
     * @param principal the authenticated reader
     */
    @MessageMapping("/group.read")
    public void markRead(
            @Payload GroupReadReceiptEvent event,
            Principal principal
    ) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        try {
            GroupReadReceiptEvent receipt = groupChatService.markGroupAsRead(event.groupId());
            if (receipt == null) {
                return; // nothing new to broadcast
            }

            String destination = "/topic/group." + receipt.groupId() + ".read";
            messagingTemplate.convertAndSend(destination, receipt);

            log.debug("Read-receipt for group {} broadcast: {} messages by user {}",
                    receipt.groupId(), receipt.readCount(), receipt.readerId());
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
