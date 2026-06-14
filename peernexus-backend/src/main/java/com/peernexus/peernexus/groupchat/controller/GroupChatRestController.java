package com.peernexus.peernexus.groupchat.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.peernexus.peernexus.common.ApiResponse;
import com.peernexus.peernexus.groupchat.dto.GroupMessageResponse;
import com.peernexus.peernexus.groupchat.dto.GroupSendMessageRequest;
import com.peernexus.peernexus.groupchat.service.GroupChatService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST controller that complements the STOMP group-chat channel with standard
 * HTTP endpoints for message history, read receipts, unread counts, and the
 * last-message preview used by the group inbox.
 *
 * <p>All endpoints require an authenticated user (enforced by Spring Security).
 * The authenticated user must be an active member of the target group;
 * otherwise a {@code 403} is returned.
 *
 * <h2>Endpoints</h2>
 * <pre>
 * GET  /api/group-chat/{groupId}/messages         – paginated message history
 * POST /api/group-chat/{groupId}/messages         – send a message (REST fallback)
 * POST /api/group-chat/{groupId}/read             – mark all messages as read
 * GET  /api/group-chat/{groupId}/unread-count     – unread message count
 * GET  /api/group-chat/{groupId}/last-message     – last-message preview for inbox
 * </pre>
 *
 * <h2>Cloudinary media</h2>
 * For IMAGE and FILE messages the client must upload the asset to Cloudinary
 * before calling the REST or STOMP send endpoint.  The {@code content} field
 * must carry the Cloudinary HTTPS URL; the {@code fileName} field should carry
 * the original filename for FILE messages.
 */
@RestController
@RequestMapping("/api/group-chat")
@RequiredArgsConstructor
public class GroupChatRestController {

    private final GroupChatService groupChatService;

    // ─────────────────────────────────────────────────────────────────────────
    // Message history
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns paginated message history for the given group (newest first).
     * Soft-deleted messages are included with {@code content = null} so the UI
     * can display a "This message was deleted" placeholder.
     *
     * <p>The authenticated user must be a group member.
     *
     * @param groupId  the study group primary key
     * @param pageable pagination params ({@code ?page=0&size=30})
     * @return paged list of {@link GroupMessageResponse}
     */
    @GetMapping("/{groupId}/messages")
    public ResponseEntity<ApiResponse<Page<GroupMessageResponse>>> getHistory(
            @PathVariable Long groupId,
            Pageable pageable
    ) {
        Page<GroupMessageResponse> messages = groupChatService.getHistory(groupId, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<GroupMessageResponse>>builder()
                .success(true)
                .message("Message history retrieved")
                .data(messages)
                .build());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Send message (REST fallback for non-WebSocket clients)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Sends a message to the group via REST (non-WebSocket fallback).
     *
     * <p>Prefer the STOMP {@code /app/group.send} destination for real-time
     * delivery.  This endpoint is provided for REST-only clients (e.g. mobile
     * apps that do not maintain a WebSocket connection).
     *
     * <p>The authenticated user must be a group member.
     *
     * @param groupId the study group primary key (must match {@code request.groupId()})
     * @param request the message payload
     * @return the persisted message as a {@link GroupMessageResponse}
     */
    @PostMapping("/{groupId}/messages")
    public ResponseEntity<ApiResponse<GroupMessageResponse>> sendMessage(
            @PathVariable Long groupId,
            @Valid @RequestBody GroupSendMessageRequest request
    ) {
        GroupMessageResponse response = groupChatService.sendMessage(request);
        return ResponseEntity.ok(ApiResponse.<GroupMessageResponse>builder()
                .success(true)
                .message("Message sent")
                .data(response)
                .build());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Read receipts
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Marks all unread messages in the group as read for the authenticated user.
     *
     * <p>Clients should call this when the user opens the group chat view.
     * For real-time read receipts visible to other members, prefer the STOMP
     * {@code /app/group.read} destination which also broadcasts the event.
     *
     * <p>The authenticated user must be a group member.
     *
     * @param groupId the study group primary key
     * @return number of messages newly marked as read
     */
    @PostMapping("/{groupId}/read")
    public ResponseEntity<ApiResponse<Integer>> markAsRead(
            @PathVariable Long groupId
    ) {
        var receipt = groupChatService.markGroupAsRead(groupId);
        int count = receipt != null ? receipt.readCount() : 0;
        return ResponseEntity.ok(ApiResponse.<Integer>builder()
                .success(true)
                .message(count + " message(s) marked as read")
                .data(count)
                .build());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Unread count
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns the number of unread messages in the group for the authenticated user.
     *
     * <p>Use this to populate notification badges in the group list view.
     *
     * @param groupId the study group primary key
     * @return unread message count
     */
    @GetMapping("/{groupId}/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @PathVariable Long groupId
    ) {
        long count = groupChatService.countUnread(groupId);
        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .success(true)
                .message("Unread count retrieved")
                .data(count)
                .build());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Last message preview
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns the last non-deleted message in the group for inbox preview.
     *
     * <p>The authenticated user must be a group member.
     *
     * @param groupId the study group primary key
     * @return last message DTO, or {@code null} data if no messages exist
     */
    @GetMapping("/{groupId}/last-message")
    public ResponseEntity<ApiResponse<GroupMessageResponse>> getLastMessage(
            @PathVariable Long groupId
    ) {
        GroupMessageResponse last = groupChatService.getLastMessage(groupId);
        return ResponseEntity.ok(ApiResponse.<GroupMessageResponse>builder()
                .success(true)
                .message(last != null ? "Last message retrieved" : "No messages yet")
                .data(last)
                .build());
    }
}
