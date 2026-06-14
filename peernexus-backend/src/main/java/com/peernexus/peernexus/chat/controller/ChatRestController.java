package com.peernexus.peernexus.chat.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.peernexus.peernexus.chat.dto.ChatRoomResponse;
import com.peernexus.peernexus.chat.dto.MessageResponse;
import com.peernexus.peernexus.chat.entity.ChatRoom;
import com.peernexus.peernexus.chat.service.ChatService;
import com.peernexus.peernexus.common.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * REST controller that complements the STOMP chat channel with standard
 * HTTP endpoints for room management, message history, and read receipts.
 *
 * <p>All endpoints require an authenticated user (enforced by Spring Security).
 *
 * <h2>Endpoints</h2>
 * <pre>
 * GET  /api/chat/rooms                          – list my chat rooms (inbox)
 * GET  /api/chat/rooms/{otherUserId}/or-create  – get or create room with a user
 * GET  /api/chat/rooms/{roomId}/messages        – paginated message history
 * POST /api/chat/rooms/{roomId}/read            – mark room messages as read
 * </pre>
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatService chatService;

    // ─────────────────────────────────────────────────────────────────────────
    // Room endpoints
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns all chat rooms the authenticated user participates in, ordered
     * by most-recent activity.  Includes last-message preview and unread count.
     *
     * @return list of {@link ChatRoomResponse}
     */
    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<ChatRoomResponse>>> getMyRooms() {
        List<ChatRoomResponse> rooms = chatService.getMyRooms();
        return ResponseEntity.ok(ApiResponse.<List<ChatRoomResponse>>builder()
                .success(true)
                .message("Chat rooms retrieved")
                .data(rooms)
                .build());
    }

    /**
     * Gets the existing chat room with {@code otherUserId} or creates one if
     * none exists yet.  The two users must have an ACCEPTED connection.
     *
     * @param otherUserId the ID of the user to chat with
     * @return the chat room ID and metadata wrapped in {@link ApiResponse}
     */
    @PostMapping("/rooms/{otherUserId}/or-create")
    public ResponseEntity<ApiResponse<Long>> getOrCreateRoom(
            @PathVariable Long otherUserId
    ) {
        ChatRoom room = chatService.getOrCreateRoom(otherUserId);
        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .success(true)
                .message("Chat room ready")
                .data(room.getId())
                .build());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Message history
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns paginated message history for the given room (newest first).
     * The authenticated user must be a participant.
     *
     * @param roomId   the chat room ID
     * @param pageable pagination params ({@code ?page=0&size=30})
     * @return paged list of {@link MessageResponse}
     */
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ApiResponse<Page<MessageResponse>>> getHistory(
            @PathVariable Long roomId,
            Pageable pageable
    ) {
        Page<MessageResponse> messages = chatService.getHistory(roomId, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<MessageResponse>>builder()
                .success(true)
                .message("Message history")
                .data(messages)
                .build());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Read receipts
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Marks all unread messages in the given room as read.
     * Clients should call this when the user opens a conversation.
     *
     * <p>Note: for real-time read receipts the STOMP {@code /app/chat.read}
     * destination should be used instead; this REST endpoint is provided as a
     * fallback for non-WebSocket contexts (e.g. REST-only mobile clients).
     *
     * @param roomId the chat room ID
     * @return number of messages marked as read
     */
    @PostMapping("/rooms/{roomId}/read")
    public ResponseEntity<ApiResponse<Integer>> markAsRead(
            @PathVariable Long roomId
    ) {
        int count = chatService.markRoomAsRead(roomId);
        return ResponseEntity.ok(ApiResponse.<Integer>builder()
                .success(true)
                .message(count + " message(s) marked as read")
                .data(count)
                .build());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Search
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> search(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "roomId", required = false) Long roomId,
            @RequestParam(value = "senderId", required = false) Long senderId
    ) {
        List<MessageResponse> results = chatService.searchMessages(query, roomId, senderId);
        return ResponseEntity.ok(ApiResponse.<List<MessageResponse>>builder()
                .success(true)
                .message("Search results")
                .data(results)
                .build());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Pinned messages
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/rooms/{roomId}/pinned")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getPinned(
            @PathVariable Long roomId
    ) {
        List<MessageResponse> pins = chatService.getPinnedMessages(roomId);
        return ResponseEntity.ok(ApiResponse.<List<MessageResponse>>builder()
                .success(true)
                .message("Pinned messages retrieved")
                .data(pins)
                .build());
    }

    @PostMapping("/messages/{messageId}/pin")
    public ResponseEntity<ApiResponse<MessageResponse>> togglePin(
            @PathVariable Long messageId
    ) {
        MessageResponse msg = chatService.togglePinMessage(messageId);
        return ResponseEntity.ok(ApiResponse.<MessageResponse>builder()
                .success(true)
                .message(msg.pinned() ? "Message pinned" : "Message unpinned")
                .data(msg)
                .build());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Delete for me
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/messages/{messageId}/delete-for-me")
    public ResponseEntity<ApiResponse<Void>> deleteForMe(
            @PathVariable Long messageId
    ) {
        chatService.deleteMessageForMe(messageId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Message deleted locally")
                .build());
    }
}
