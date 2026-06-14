package com.peernexus.peernexus.chat.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.peernexus.peernexus.chat.dto.ChatRoomResponse;
import com.peernexus.peernexus.chat.dto.MessageReactionResponse;
import com.peernexus.peernexus.chat.dto.MessageResponse;
import com.peernexus.peernexus.chat.dto.SendMessageRequest;
import com.peernexus.peernexus.chat.entity.ChatRoom;

/**
 * Business-logic interface for the private chat module.
 */
public interface ChatService {

    /**
     * Gets an existing chat room between the current user and {@code otherUserId},
     * or creates one if none exists yet.  The two users must have an ACCEPTED
     * connection; an exception is thrown otherwise.
     *
     * @param otherUserId the ID of the other participant
     * @return the (possibly newly created) chat room entity
     */
    ChatRoom getOrCreateRoom(Long otherUserId);

    /**
     * Returns all chat rooms the current user participates in, ordered by
     * most-recent activity.
     *
     * @return list of chat room response DTOs with last-message preview
     */
    List<ChatRoomResponse> getMyRooms();

    /**
     * Returns a paginated, newest-first message history for the given room.
     * The current user must be a participant in the room.
     *
     * @param roomId   the chat room primary key
     * @param pageable page / size (recommended size: 30)
     * @return page of message response DTOs
     */
    Page<MessageResponse> getHistory(Long roomId, Pageable pageable);

    /**
     * Persists and broadcasts a new message.
     * Validates that the sender has an ACCEPTED connection with the recipient
     * and that the sender is a participant in the room.
     *
     * @param request the inbound STOMP payload
     * @return the persisted message as a response DTO
     */
    MessageResponse sendMessage(SendMessageRequest request);

    /**
     * Marks all unread messages in the given room (not sent by the caller) as
     * read and returns a read-receipt event so the service layer can broadcast it.
     *
     * @param roomId the chat room
     * @return number of messages that were marked read
     */
    int markRoomAsRead(Long roomId);

    /**
     * Searches messages within rooms the current user participates in.
     */
    List<MessageResponse> searchMessages(String query, Long roomId, Long senderId);

    /**
     * Adds or toggles a user reaction to a message.
     */
    List<MessageReactionResponse> toggleReaction(Long messageId, String reaction);

    /**
     * Edits a message's content within a 15-minute timeframe.
     */
    MessageResponse editMessage(Long messageId, String content);

    /**
     * Deletes a message for everyone (within a 1-hour timeframe).
     */
    MessageResponse deleteMessageForEveryone(Long messageId);

    /**
     * Deletes a message locally for the current user.
     */
    void deleteMessageForMe(Long messageId);

    /**
     * Toggles the pinned status of a message.
     */
    MessageResponse togglePinMessage(Long messageId);

    /**
     * Gets all pinned messages in a chat room.
     */
    List<MessageResponse> getPinnedMessages(Long roomId);

    /**
     * Marks all SENT messages intended for the recipient as DELIVERED upon connecting.
     */
    void markUndeliveredAsDelivered(Long userId);
}
