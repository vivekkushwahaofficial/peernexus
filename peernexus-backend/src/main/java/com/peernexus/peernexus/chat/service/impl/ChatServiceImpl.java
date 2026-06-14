package com.peernexus.peernexus.chat.service.impl;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.peernexus.peernexus.chat.dto.ChatRoomResponse;
import com.peernexus.peernexus.chat.dto.MessageReactionResponse;
import com.peernexus.peernexus.chat.dto.MessageResponse;
import com.peernexus.peernexus.chat.dto.ReactionUpdateEvent;
import com.peernexus.peernexus.chat.dto.SendMessageRequest;
import com.peernexus.peernexus.chat.dto.UserChatResponse;
import com.peernexus.peernexus.chat.entity.ChatRoom;
import com.peernexus.peernexus.chat.entity.Message;
import com.peernexus.peernexus.chat.entity.MessageEdit;
import com.peernexus.peernexus.chat.entity.MessageReaction;
import com.peernexus.peernexus.chat.entity.MessageStatus;
import com.peernexus.peernexus.chat.entity.MessageType;
import com.peernexus.peernexus.chat.entity.UserDeletedMessage;
import com.peernexus.peernexus.chat.repository.ChatRoomRepository;
import com.peernexus.peernexus.chat.repository.MessageReactionRepository;
import com.peernexus.peernexus.chat.repository.MessageRepository;
import com.peernexus.peernexus.chat.repository.UnreadCountProjection;
import com.peernexus.peernexus.chat.repository.UserDeletedMessageRepository;
import com.peernexus.peernexus.chat.service.ChatService;
import com.peernexus.peernexus.chat.service.OnlineStatusService;
import com.peernexus.peernexus.connection.entity.ConnectionStatus;
import com.peernexus.peernexus.connection.repository.ConnectionRepository;
import com.peernexus.peernexus.exception.ResourceNotFoundException;
import com.peernexus.peernexus.exception.UnauthorizedException;
import com.peernexus.peernexus.user.entity.User;
import com.peernexus.peernexus.user.repository.UserRepository;
import com.peernexus.peernexus.user.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Upgrade implementation of private chat module.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final OnlineStatusService onlineStatusService;
    private final MessageReactionRepository messageReactionRepository;
    private final UserDeletedMessageRepository userDeletedMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // -------------------------------------------------------------------------
    // Room management
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public ChatRoom getOrCreateRoom(Long otherUserId) {
        User me = resolveCurrentUser();
        User other = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + otherUserId));

        requireAcceptedConnection(me.getId(), otherUserId);

        return chatRoomRepository.findByParticipants(me.getId(), otherUserId)
                .orElseGet(() -> createRoom(me, other));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getMyRooms() {
        User me = resolveCurrentUser();
        List<ChatRoom> rooms = chatRoomRepository.findByParticipant(me.getId());

        List<Long> roomIds = rooms.stream().map(ChatRoom::getId).toList();
        java.util.Map<Long, Long> unreadMap = roomIds.isEmpty() ? java.util.Map.of() :
                messageRepository.countUnreadGroupedByRoom(roomIds, me.getId()).stream()
                        .collect(Collectors.toMap(
                                UnreadCountProjection::getRoomId,
                                UnreadCountProjection::getCnt
                        ));

        return rooms.stream()
                .map(room -> {
                    long unread = unreadMap.getOrDefault(room.getId(), 0L);
                    return toRoomResponse(room, me.getId(), unread);
                })
                .toList();
    }

    // -------------------------------------------------------------------------
    // Message history
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public Page<MessageResponse> getHistory(Long roomId, Pageable pageable) {
        User me = resolveCurrentUser();
        ChatRoom room = findRoomForParticipant(roomId, me.getId());
        return messageRepository.findByChatRoomIdForUser(room.getId(), me.getId(), pageable)
                .map(this::toMessageResponse);
    }

    // -------------------------------------------------------------------------
    // Send message
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request) {
        User sender = resolveCurrentUser();

        ChatRoom room = chatRoomRepository.findById(request.chatRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Chat room not found: " + request.chatRoomId()));

        requireParticipant(room, sender.getId());

        Long otherUserId = room.getUser1().getId().equals(sender.getId())
                ? room.getUser2().getId()
                : room.getUser1().getId();

        requireAcceptedConnection(sender.getId(), otherUserId);

        // WhatsApp Style Delivery: SENT or DELIVERED based on presence
        MessageStatus initialStatus = onlineStatusService.isOnline(otherUserId)
                ? MessageStatus.DELIVERED
                : MessageStatus.SENT;

        Message message = Message.builder()
                .chatRoom(room)
                .sender(sender)
                .content(request.content())
                .type(request.type())
                .fileName(request.fileName())
                .fileUrl(request.fileUrl())
                .fileSize(request.fileSize())
                .mimeType(request.mimeType())
                .status(initialStatus)
                .deleted(false)
                .build();
        Message saved = messageRepository.save(message);

        // Update room last-message preview
        room.setLastMessageContent(request.content());
        room.setLastMessageAt(saved.getSentAt());
        room.setLastMessageSender(sender);
        room.setLastMessageType(saved.getType());
        chatRoomRepository.save(room);

        log.debug("Message {} persisted in room {}", saved.getId(), room.getId());
        return toMessageResponse(saved);
    }

    // -------------------------------------------------------------------------
    // Read receipts
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public int markRoomAsRead(Long roomId) {
        User me = resolveCurrentUser();
        ChatRoom room = findRoomForParticipant(roomId, me.getId());
        int updated = messageRepository.markAllRead(room.getId(), me.getId(), Instant.now());
        log.debug("Marked {} messages as read in room {} by user {}", updated, roomId, me.getId());
        return updated;
    }

    // -------------------------------------------------------------------------
    // Presence / Status Updates
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public void markUndeliveredAsDelivered(Long userId) {
        List<Message> undelivered = messageRepository.findSentMessagesForRecipient(userId);
        if (undelivered.isEmpty()) return;

        messageRepository.markSentAsDelivered(userId);

        for (Message m : undelivered) {
            String senderEmail = m.getSender().getEmail();
            messagingTemplate.convertAndSendToUser(
                    senderEmail,
                    "/queue/read-receipt",
                    new com.peernexus.peernexus.chat.dto.ReadReceiptEvent(
                            m.getChatRoom().getId(),
                            userId,
                            Instant.now() // Notify delivery updates
                    )
            );
        }
    }

    // -------------------------------------------------------------------------
    // Reaction & Modifications (Search, Edit, Delete, Pin)
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> searchMessages(String query, Long roomId, Long senderId) {
        User me = resolveCurrentUser();
        return messageRepository.searchMessages(me.getId(), roomId, senderId, query).stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Override
    @Transactional
    public List<MessageReactionResponse> toggleReaction(Long messageId, String reaction) {
        User me = resolveCurrentUser();
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));

        requireParticipant(message.getChatRoom(), me.getId());

        Optional<MessageReaction> existing = messageReactionRepository
                .findByMessageIdAndUserIdAndReaction(messageId, me.getId(), reaction);

        if (existing.isPresent()) {
            messageReactionRepository.delete(existing.get());
        } else {
            MessageReaction newReaction = MessageReaction.builder()
                    .message(message)
                    .user(me)
                    .reaction(reaction)
                    .build();
            messageReactionRepository.save(newReaction);
        }

        List<MessageReaction> reactions = messageReactionRepository.findByMessageId(messageId);
        List<MessageReactionResponse> response = reactions.stream()
                .map(r -> MessageReactionResponse.builder()
                        .id(r.getId())
                        .userId(r.getUser().getId())
                        .reaction(r.getReaction())
                        .build())
                .toList();

        // Broadcast reaction updates
        ReactionUpdateEvent updateEvent = new ReactionUpdateEvent(message.getChatRoom().getId(), messageId, response);
        messagingTemplate.convertAndSendToUser(me.getEmail(), "/queue/reactions", updateEvent);
        messagingTemplate.convertAndSendToUser(
                resolveRecipientUsername(message.getChatRoom(), me.getEmail()), 
                "/queue/reactions", 
                updateEvent
        );

        return response;
    }

    @Override
    @Transactional
    public MessageResponse editMessage(Long messageId, String content) {
        User me = resolveCurrentUser();
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));

        if (!message.getSender().getId().equals(me.getId())) {
            throw new UnauthorizedException("You can only edit your own messages");
        }

        if (message.isDeleted()) {
            throw new IllegalArgumentException("Cannot edit a deleted message");
        }

        Duration age = Duration.between(message.getSentAt(), Instant.now());
        if (age.toMinutes() >= 15) {
            throw new IllegalArgumentException("Message editing period has expired (15m limit)");
        }

        MessageEdit editHistory = MessageEdit.builder()
                .message(message)
                .oldContent(message.getContent())
                .editedAt(Instant.now())
                .build();
        message.getEdits().add(editHistory);

        message.setContent(content);
        message.setEdited(true);
        Message saved = messageRepository.save(message);

        MessageResponse response = toMessageResponse(saved);

        // Broadcast to both users
        messagingTemplate.convertAndSendToUser(me.getEmail(), "/queue/messages", response);
        messagingTemplate.convertAndSendToUser(
                resolveRecipientUsername(saved.getChatRoom(), me.getEmail()), 
                "/queue/messages", 
                response
        );

        return response;
    }

    @Override
    @Transactional
    public MessageResponse deleteMessageForEveryone(Long messageId) {
        User me = resolveCurrentUser();
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));

        if (!message.getSender().getId().equals(me.getId())) {
            throw new UnauthorizedException("You can only delete your own messages");
        }

        Duration age = Duration.between(message.getSentAt(), Instant.now());
        if (age.toHours() >= 1) {
            throw new IllegalArgumentException("Message deletion for everyone period has expired (1h limit)");
        }

        message.setContent(null);
        message.setDeleted(true);
        message.setFileUrl(null);
        message.setFileName(null);
        message.setFileSize(null);
        message.setMimeType(null);
        Message saved = messageRepository.save(message);

        MessageResponse response = toMessageResponse(saved);

        // Broadcast to both users
        messagingTemplate.convertAndSendToUser(me.getEmail(), "/queue/messages", response);
        messagingTemplate.convertAndSendToUser(
                resolveRecipientUsername(saved.getChatRoom(), me.getEmail()), 
                "/queue/messages", 
                response
        );

        return response;
    }

    @Override
    @Transactional
    public void deleteMessageForMe(Long messageId) {
        User me = resolveCurrentUser();
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));

        requireParticipant(message.getChatRoom(), me.getId());

        if (!userDeletedMessageRepository.existsByUserIdAndMessageId(me.getId(), messageId)) {
            UserDeletedMessage del = UserDeletedMessage.builder()
                    .user(me)
                    .message(message)
                    .build();
            userDeletedMessageRepository.save(del);
        }
    }

    @Override
    @Transactional
    public MessageResponse togglePinMessage(Long messageId) {
        User me = resolveCurrentUser();
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));

        requireParticipant(message.getChatRoom(), me.getId());

        message.setPinned(!message.isPinned());
        Message saved = messageRepository.save(message);

        MessageResponse response = toMessageResponse(saved);

        // Broadcast pin update event
        messagingTemplate.convertAndSendToUser(me.getEmail(), "/queue/pins", response);
        messagingTemplate.convertAndSendToUser(
                resolveRecipientUsername(saved.getChatRoom(), me.getEmail()), 
                "/queue/pins", 
                response
        );

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> getPinnedMessages(Long roomId) {
        User me = resolveCurrentUser();
        ChatRoom room = findRoomForParticipant(roomId, me.getId());

        return messageRepository.findByChatRoomIdForUser(room.getId(), me.getId(), Pageable.unpaged()).stream()
                .filter(Message::isPinned)
                .map(this::toMessageResponse)
                .toList();
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private ChatRoom createRoom(User a, User b) {
        User user1 = a.getId() < b.getId() ? a : b;
        User user2 = a.getId() < b.getId() ? b : a;

        ChatRoom room = ChatRoom.builder()
                .user1(user1)
                .user2(user2)
                .build();
        return chatRoomRepository.save(room);
    }

    private void requireAcceptedConnection(Long userA, Long userB) {
        connectionRepository.findBetweenUsers(userA, userB)
                .filter(c -> c.getStatus() == ConnectionStatus.ACCEPTED)
                .orElseThrow(() -> new UnauthorizedException(
                        "You must be connected to this user to start a chat"));
    }

    private void requireParticipant(ChatRoom room, Long userId) {
        boolean isParticipant = room.getUser1().getId().equals(userId)
                || room.getUser2().getId().equals(userId);
        if (!isParticipant) {
            throw new UnauthorizedException("You are not a participant in this chat room");
        }
    }

    private ChatRoom findRoomForParticipant(Long roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat room not found: " + roomId));
        requireParticipant(room, userId);
        return room;
    }

    private User resolveCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl details) {
            return userRepository.findById(details.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        throw new UnauthorizedException("Unauthorized");
    }

    // -------------------------------------------------------------------------
    // Mapping helpers
    // -------------------------------------------------------------------------

    private MessageResponse toMessageResponse(Message m) {
        List<MessageReactionResponse> reactionDtos = m.getReactions() == null ? List.of() :
                m.getReactions().stream()
                        .map(r -> MessageReactionResponse.builder()
                                .id(r.getId())
                                .userId(r.getUser().getId())
                                .reaction(r.getReaction())
                                .build())
                        .toList();

        return MessageResponse.builder()
                .id(m.getId())
                .chatRoomId(m.getChatRoom().getId())
                .senderId(m.getSender().getId())
                .senderName(m.getSender().getName())
                .senderProfilePicture(m.getSender().getProfilePicture())
                .content(m.isDeleted() ? null : m.getContent())
                .type(m.getType())
                .fileName(m.getFileName())
                .fileUrl(m.getFileUrl())
                .fileSize(m.getFileSize())
                .mimeType(m.getMimeType())
                .status(m.getStatus())
                .reactions(reactionDtos)
                .edited(m.isEdited())
                .pinned(m.isPinned())
                .readAt(m.getReadAt())
                .sentAt(m.getSentAt())
                .deleted(m.isDeleted())
                .build();
    }

    private ChatRoomResponse toRoomResponse(ChatRoom room, Long myId, long unread) {
        User other = room.getUser1().getId().equals(myId) ? room.getUser2() : room.getUser1();

        UserChatResponse otherUserDto = UserChatResponse.builder()
                .id(other.getId())
                .name(other.getName())
                .profilePicture(other.getProfilePicture())
                .online(other.isOnline())
                .lastSeen(other.getLastSeen())
                .build();

        return ChatRoomResponse.builder()
                .roomId(room.getId())
                .otherUser(otherUserDto)
                .lastMessageContent(room.getLastMessageContent())
                .lastMessageType(room.getLastMessageType())
                .lastMessageAt(room.getLastMessageAt())
                .lastMessageSenderId(
                        room.getLastMessageSender() != null
                                ? room.getLastMessageSender().getId()
                                : null
                )
                .unreadCount(unread)
                .build();
    }

    private String resolveRecipientUsername(ChatRoom room, String senderEmail) {
        String user1Email = room.getUser1().getEmail();
        String user2Email = room.getUser2().getEmail();
        return user1Email.equals(senderEmail) ? user2Email : user1Email;
    }
}
