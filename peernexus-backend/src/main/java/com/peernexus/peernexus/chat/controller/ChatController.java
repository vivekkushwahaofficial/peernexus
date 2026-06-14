package com.peernexus.peernexus.chat.controller;

import java.security.Principal;
import java.time.Instant;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.peernexus.peernexus.chat.dto.MessageResponse;
import com.peernexus.peernexus.chat.dto.OnlineStatusEvent;
import com.peernexus.peernexus.chat.dto.ReadReceiptEvent;
import com.peernexus.peernexus.chat.dto.SendMessageRequest;
import com.peernexus.peernexus.chat.dto.TypingEvent;
import com.peernexus.peernexus.chat.entity.ChatRoom;
import com.peernexus.peernexus.chat.repository.ChatRoomRepository;
import com.peernexus.peernexus.chat.service.ChatService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import com.peernexus.peernexus.chat.service.OnlineStatusService;
import com.peernexus.peernexus.exception.ResourceNotFoundException;
import com.peernexus.peernexus.user.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * STOMP message handler for the real-time chat module.
 *
 * <p>All methods are triggered by client STOMP {@code SEND} frames addressed
 * to the {@code /app/**} prefix.  Responses are pushed back to subscribers via
 * the in-memory broker.
 *
 * <h2>Destination map</h2>
 * <pre>
 * Client SEND   /app/chat.send      → persists message → /user/{recipient}/queue/messages
 * Client SEND   /app/chat.typing    → forwards event   → /user/{recipient}/queue/typing
 * Client SEND   /app/chat.read      → marks read       → /user/{sender}/queue/read-receipt
 * </pre>
 *
 * <h2>Presence</h2>
 * Connect / disconnect events are detected via Spring's
 * {@link WebSocketEventListener} which updates {@link OnlineStatusService} and
 * broadcasts to {@code /topic/status/{userId}}.
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ChatRoomRepository chatRoomRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final OnlineStatusService onlineStatusService;

    // ─────────────────────────────────────────────────────────────────────────
    // Send message
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Handles a client {@code SEND} to {@code /app/chat.send}.
     *
     * <ol>
     *   <li>Persists the message via {@link ChatService#sendMessage}.</li>
     *   <li>Pushes the response to the sender's private queue (so the sender
     *       also receives the confirmed / persisted version with its DB ID).</li>
     *   <li>Pushes to the recipient's private queue.</li>
     * </ol>
     *
     * @param request   the inbound STOMP payload (deserialized from JSON)
     * @param principal the authenticated sender
     */
    @MessageMapping("/chat.send")
    public void sendMessage(
            @Payload SendMessageRequest request,
            Principal principal
    ) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        try {
            MessageResponse response = chatService.sendMessage(request);

            // Resolve the other participant to deliver the message
            ChatRoom room = chatRoomRepository.findByIdWithParticipants(request.chatRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chat room not found"));

            String senderUsername = principal.getName(); // email
            String recipientUsername = resolveRecipientUsername(room, senderUsername);

            // Deliver to recipient
            messagingTemplate.convertAndSendToUser(
                    recipientUsername,
                    "/queue/messages",
                    response
            );

            // Echo confirmed message back to sender (so UI can replace the optimistic placeholder)
            messagingTemplate.convertAndSendToUser(
                    senderUsername,
                    "/queue/messages",
                    response
            );

            log.debug("Message {} delivered in room {}", response.id(), request.chatRoomId());
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Typing indicator
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Handles a client {@code SEND} to {@code /app/chat.typing}.
     *
     * <p>Forwards the typing event to the other participant's private queue.
     *
     * @param event     the typing indicator payload
     * @param principal the authenticated typer
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(
            @Payload TypingEvent event,
            Principal principal
    ) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        try {
            ChatRoom room = chatRoomRepository.findByIdWithParticipants(event.chatRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chat room not found"));

            String recipientUsername = resolveRecipientUsername(room, principal.getName());

            messagingTemplate.convertAndSendToUser(
                    recipientUsername,
                    "/queue/typing",
                    event
            );
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Read receipt
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Handles a client {@code SEND} to {@code /app/chat.read}.
     *
     * <p>Marks all unread messages in the given room as read and notifies the
     * original senders via their private read-receipt queue.
     *
     * @param accessor  STOMP header accessor (used to extract the chat room ID)
     * @param principal the authenticated reader
     */
    @MessageMapping("/chat.read")
    public void markRead(
            SimpMessageHeaderAccessor accessor,
            @Payload ReadReceiptEvent event,
            Principal principal
    ) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        try {
            int updated = chatService.markRoomAsRead(event.chatRoomId());
            if (updated == 0) {
                return; // nothing to notify
            }

            ChatRoom room = chatRoomRepository.findByIdWithParticipants(event.chatRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chat room not found"));

            // Notify the sender of those messages that they have been read
            String senderUsername = resolveRecipientUsername(room, principal.getName());

            ReadReceiptEvent receipt = new ReadReceiptEvent(
                    event.chatRoomId(),
                    event.readerId(),
                    Instant.now()
            );

            messagingTemplate.convertAndSendToUser(
                    senderUsername,
                    "/queue/read-receipt",
                    receipt
            );
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Reactions
    // ─────────────────────────────────────────────────────────────────────────

    @MessageMapping("/chat.reaction")
    public void handleReaction(
            @Payload com.peernexus.peernexus.chat.dto.MessageReactionRequest request,
            Principal principal
    ) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        try {
            chatService.toggleReaction(request.messageId(), request.reaction());
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Edit Message
    // ─────────────────────────────────────────────────────────────────────────

    @MessageMapping("/chat.edit")
    public void handleEdit(
            @Payload com.peernexus.peernexus.chat.dto.EditMessageRequest request,
            Principal principal
    ) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        try {
            chatService.editMessage(request.messageId(), request.content());
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Delete for Everyone
    // ─────────────────────────────────────────────────────────────────────────

    @MessageMapping("/chat.delete-for-everyone")
    public void handleDeleteForEveryone(
            @Payload Long messageId,
            Principal principal
    ) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        try {
            chatService.deleteMessageForEveryone(messageId);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Resolves the email (used as STOMP principal name) of the OTHER participant
     * in the room.
     */
    private String resolveRecipientUsername(ChatRoom room, String senderEmail) {
        String user1Email = room.getUser1().getEmail();
        String user2Email = room.getUser2().getEmail();
        return user1Email.equals(senderEmail) ? user2Email : user1Email;
    }
}
