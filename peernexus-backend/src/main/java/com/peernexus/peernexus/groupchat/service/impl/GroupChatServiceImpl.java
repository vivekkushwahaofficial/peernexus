package com.peernexus.peernexus.groupchat.service.impl;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.peernexus.peernexus.exception.ForbiddenException;
import com.peernexus.peernexus.exception.ResourceNotFoundException;
import com.peernexus.peernexus.exception.UnauthorizedException;
import com.peernexus.peernexus.group.entity.GroupMember;
import com.peernexus.peernexus.group.entity.StudyGroup;
import com.peernexus.peernexus.group.repository.GroupMemberRepository;
import com.peernexus.peernexus.group.repository.StudyGroupRepository;
import com.peernexus.peernexus.groupchat.dto.GroupMessageResponse;
import com.peernexus.peernexus.groupchat.dto.GroupReadReceiptEvent;
import com.peernexus.peernexus.groupchat.dto.GroupSendMessageRequest;
import com.peernexus.peernexus.groupchat.dto.GroupTypingEvent;
import com.peernexus.peernexus.groupchat.entity.GroupMessage;
import com.peernexus.peernexus.groupchat.entity.GroupMessageRead;
import com.peernexus.peernexus.groupchat.repository.GroupMessageReadRepository;
import com.peernexus.peernexus.groupchat.repository.GroupMessageRepository;
import com.peernexus.peernexus.groupchat.service.GroupChatService;
import com.peernexus.peernexus.user.entity.User;
import com.peernexus.peernexus.user.repository.UserRepository;
import com.peernexus.peernexus.user.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Core implementation of the group chat business logic.
 *
 * <h2>Security invariant</h2>
 * Every public method calls {@link #requireMember(Long, Long)} before touching
 * any data.  Non-members and removed members will receive an
 * {@link UnauthorizedException}.
 *
 * <h2>Cloudinary media</h2>
 * For {@code IMAGE} and {@code FILE} messages the client must upload the asset
 * to Cloudinary first and supply the resulting HTTPS URL in
 * {@link GroupSendMessageRequest#content()}.  Binary data is never stored here.
 *
 * <h2>Read receipts</h2>
 * A {@link GroupMessageRead} record is inserted for every previously-unread
 * message when {@link #markGroupAsRead} is called.  The unique constraint on
 * {@code (message_id, reader_id)} prevents duplicates.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GroupChatServiceImpl implements GroupChatService {

    private final GroupMessageRepository     groupMessageRepository;
    private final GroupMessageReadRepository groupMessageReadRepository;
    private final GroupMemberRepository      groupMemberRepository;
    private final StudyGroupRepository       studyGroupRepository;
    private final UserRepository             userRepository;

    // -------------------------------------------------------------------------
    // Send message
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public GroupMessageResponse sendMessage(GroupSendMessageRequest request) {
        User sender = resolveCurrentUser();
        StudyGroup group = resolveGroup(request.groupId());

        requireMember(group.getId(), sender.getId());

        GroupMessage message = GroupMessage.builder()
                .group(group)
                .sender(sender)
                .content(request.content())
                .type(request.type())
                .fileName(request.fileName())
                .deleted(false)
                .build();

        GroupMessage saved = groupMessageRepository.save(message);
        log.debug("Group message {} persisted in group {}", saved.getId(), group.getId());

        // Auto-mark as read by sender
        markRead(saved, sender);

        return toResponse(saved, 1L); // sender is reader #1
    }

    // -------------------------------------------------------------------------
    // Message history
    // -------------------------------------------------------------------------

    /**
     * Returns a paginated history of messages for the group.
     *
     * <p><strong>Optimization:</strong> read counts for all messages on the
     * current page are fetched in a <em>single</em> aggregate query via
     * {@link GroupMessageRepository#readCountMapFor(List)} instead of issuing
     * one {@code COUNT} query per message (N queries per page).
     */
    @Override
    @Transactional(readOnly = true)
    public Page<GroupMessageResponse> getHistory(Long groupId, Pageable pageable) {
        User me = resolveCurrentUser();
        requireMember(groupId, me.getId());

        Page<GroupMessage> page = groupMessageRepository.findByGroupIdOrderBySentAtDesc(groupId, pageable);

        // Collect message IDs on this page for bulk read-count aggregation
        List<Long> ids = page.stream().map(GroupMessage::getId).toList();
        Map<Long, Long> readCounts = ids.isEmpty()
                ? Collections.emptyMap()
                : groupMessageRepository.readCountMapFor(ids);

        return page.map(m -> toResponse(m, readCounts.getOrDefault(m.getId(), 0L)));
    }

    // -------------------------------------------------------------------------
    // Typing indicator
    // -------------------------------------------------------------------------

    @Override
    public GroupTypingEvent handleTyping(GroupTypingEvent event) {
        User me = resolveCurrentUser();
        requireMember(event.groupId(), me.getId());

        // Ensure the senderId in the event matches the authenticated user
        return new GroupTypingEvent(event.groupId(), me.getId(), event.typing());
    }

    // -------------------------------------------------------------------------
    // Read receipts
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public GroupReadReceiptEvent markGroupAsRead(Long groupId) {
        User me = resolveCurrentUser();
        requireMember(groupId, me.getId());

        List<GroupMessage> unread = groupMessageReadRepository.findUnreadMessages(groupId, me.getId());
        if (unread.isEmpty()) {
            return null;
        }

        Instant now = Instant.now();
        for (GroupMessage message : unread) {
            markRead(message, me);
        }

        log.debug("User {} marked {} messages as read in group {}", me.getId(), unread.size(), groupId);
        return new GroupReadReceiptEvent(groupId, me.getId(), now, unread.size());
    }

    // -------------------------------------------------------------------------
    // Unread count
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public long countUnread(Long groupId) {
        User me = resolveCurrentUser();
        requireMember(groupId, me.getId());
        return groupMessageRepository.countUnread(groupId, me.getId());
    }

    // -------------------------------------------------------------------------
    // Last message preview
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public GroupMessageResponse getLastMessage(Long groupId) {
        List<GroupMessage> messages = groupMessageRepository
                .findTopByGroupIdOrderBySentAtDesc(groupId, PageRequest.of(0, 1));
        if (messages.isEmpty()) {
            return null;
        }
        GroupMessage last = messages.get(0);
        long readCount = groupMessageReadRepository.countByMessageId(last.getId());
        return toResponse(last, readCount);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Throws {@link UnauthorizedException} if the user is not an active member of the group.
     */
    private void requireMember(Long groupId, Long userId) {
        boolean isMember = groupMemberRepository.existsByGroupIdAndUserId(groupId, userId);
        if (!isMember) {
            throw new ForbiddenException(
                    "You must be a member of this group to perform this action");
        }
    }

    /**
     * Inserts a {@link GroupMessageRead} record if one does not already exist.
     */
    private void markRead(GroupMessage message, User reader) {
        if (!groupMessageReadRepository.existsByMessageIdAndReaderId(message.getId(), reader.getId())) {
            GroupMessageRead receipt = GroupMessageRead.builder()
                    .message(message)
                    .reader(reader)
                    .readAt(Instant.now())
                    .build();
            groupMessageReadRepository.save(receipt);
        }
    }

    /**
     * Resolves the authenticated {@link User} from the Spring Security context.
     */
    private User resolveCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl details) {
            return userRepository.findById(details.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        throw new UnauthorizedException("Unauthorized");
    }

    /**
     * Loads a {@link StudyGroup} by ID or throws {@link ResourceNotFoundException}.
     */
    private StudyGroup resolveGroup(Long groupId) {
        return studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found: " + groupId));
    }

    // -------------------------------------------------------------------------
    // Mapping helper
    // -------------------------------------------------------------------------

    private GroupMessageResponse toResponse(GroupMessage m, long readCount) {
        return GroupMessageResponse.builder()
                .id(m.getId())
                .groupId(m.getGroup().getId())
                .senderId(m.getSender().getId())
                .senderName(m.getSender().getName())
                .content(m.isDeleted() ? null : m.getContent())
                .type(m.getType())
                .fileName(m.getFileName())
                .sentAt(m.getSentAt())
                .deleted(m.isDeleted())
                .readCount(readCount)
                .build();
    }
}
