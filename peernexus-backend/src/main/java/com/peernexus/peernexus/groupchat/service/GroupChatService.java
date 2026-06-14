package com.peernexus.peernexus.groupchat.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.peernexus.peernexus.groupchat.dto.GroupMessageResponse;
import com.peernexus.peernexus.groupchat.dto.GroupReadReceiptEvent;
import com.peernexus.peernexus.groupchat.dto.GroupSendMessageRequest;
import com.peernexus.peernexus.groupchat.dto.GroupTypingEvent;

/**
 * Business-logic interface for the group chat module.
 *
 * <h2>Security contract</h2>
 * Every method that reads or writes data verifies that the authenticated
 * caller is an active member of the target group.  Non-members and removed
 * members receive an {@link com.peernexus.peernexus.exception.UnauthorizedException}.
 *
 * <h2>Cloudinary media</h2>
 * Binary data is never stored in MySQL.  For IMAGE and FILE messages the
 * caller must first upload the asset to Cloudinary and supply the resulting
 * HTTPS URL in {@link GroupSendMessageRequest#content()}.
 */
public interface GroupChatService {

    /**
     * Persists a new message to the given group and returns the enriched
     * response DTO (including the DB-assigned ID and {@code sentAt} timestamp).
     *
     * <p>The authenticated user must be an active member of the group.
     *
     * @param request the inbound STOMP payload
     * @return the persisted message as a response DTO
     * @throws com.peernexus.peernexus.exception.UnauthorizedException
     *         if the caller is not a group member
     * @throws com.peernexus.peernexus.exception.ResourceNotFoundException
     *         if the group does not exist
     */
    GroupMessageResponse sendMessage(GroupSendMessageRequest request);

    /**
     * Returns paginated message history for the given group, newest-first.
     *
     * <p>The authenticated user must be an active member of the group.
     * Soft-deleted messages are included so the UI can render a
     * "This message was deleted" placeholder (content will be {@code null}).
     *
     * @param groupId  the study group primary key
     * @param pageable pagination params (recommended size: 30)
     * @return page of message response DTOs
     * @throws com.peernexus.peernexus.exception.UnauthorizedException
     *         if the caller is not a group member
     */
    Page<GroupMessageResponse> getHistory(Long groupId, Pageable pageable);

    /**
     * Forwards a typing indicator for the given group without any persistence.
     *
     * <p>The event is returned so the controller can broadcast it to the
     * group topic.  The service validates group membership.
     *
     * @param event the typing indicator payload sent by the client
     * @return the same event (enriched with the caller's ID if not already set)
     * @throws com.peernexus.peernexus.exception.UnauthorizedException
     *         if the caller is not a group member
     */
    GroupTypingEvent handleTyping(GroupTypingEvent event);

    /**
     * Marks all unread messages in the group (not sent by the caller) as read
     * and returns a read-receipt event for the controller to broadcast.
     *
     * <p>If there are no unread messages the method returns {@code null} and
     * the controller should skip the broadcast.
     *
     * @param groupId the study group primary key
     * @return a read-receipt event, or {@code null} if nothing was marked read
     * @throws com.peernexus.peernexus.exception.UnauthorizedException
     *         if the caller is not a group member
     */
    GroupReadReceiptEvent markGroupAsRead(Long groupId);

    /**
     * Returns the number of unread messages in the given group for the
     * authenticated user.  Used by the REST endpoint to populate badge counts.
     *
     * @param groupId the study group primary key
     * @return unread message count
     */
    long countUnread(Long groupId);

    /**
     * Returns the last non-deleted message in the group for the inbox preview.
     *
     * @param groupId the study group primary key
     * @return last message response DTO, or {@code null} if no messages exist
     */
    GroupMessageResponse getLastMessage(Long groupId);
}
