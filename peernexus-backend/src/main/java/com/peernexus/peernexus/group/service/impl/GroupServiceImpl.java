package com.peernexus.peernexus.group.service.impl;

import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.peernexus.peernexus.exception.BadRequestException;
import com.peernexus.peernexus.exception.ResourceNotFoundException;
import com.peernexus.peernexus.exception.UnauthorizedException;
import com.peernexus.peernexus.group.dto.CreateGroupRequest;
import com.peernexus.peernexus.group.dto.GroupMemberResponse;
import com.peernexus.peernexus.group.dto.GroupResponse;
import com.peernexus.peernexus.group.dto.JoinRequestBody;
import com.peernexus.peernexus.group.dto.JoinRequestResponse;
import com.peernexus.peernexus.group.dto.UpdateGroupRequest;
import com.peernexus.peernexus.group.entity.GroupJoinRequest;
import com.peernexus.peernexus.group.entity.GroupMember;
import com.peernexus.peernexus.group.entity.GroupRole;
import com.peernexus.peernexus.group.entity.JoinRequestStatus;
import com.peernexus.peernexus.group.entity.StudyGroup;
import com.peernexus.peernexus.group.repository.GroupJoinRequestRepository;
import com.peernexus.peernexus.group.repository.GroupMemberRepository;
import com.peernexus.peernexus.group.repository.StudyGroupRepository;
import com.peernexus.peernexus.group.service.GroupService;
import com.peernexus.peernexus.groupchat.repository.GroupMessageReadRepository;
import com.peernexus.peernexus.groupchat.repository.GroupMessageRepository;
import com.peernexus.peernexus.notification.entity.NotificationType;
import com.peernexus.peernexus.notification.service.NotificationService;
import com.peernexus.peernexus.user.entity.User;
import com.peernexus.peernexus.user.repository.UserRepository;
import com.peernexus.peernexus.user.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementation of all study-group business logic.
 *
 * <h2>Ownership invariant</h2>
 * Every group always has exactly one {@link GroupRole#OWNER}.
 * <ul>
 *   <li>Created by {@link #createGroup} — the creator is set as OWNER.</li>
 *   <li>Changed by {@link #transferOwnership} — atomic swap of roles.</li>
 *   <li>OWNER cannot leave or be removed until ownership is transferred.</li>
 * </ul>
 *
 * <h2>Authorization model</h2>
 * <ul>
 *   <li>Delete group  → OWNER only</li>
 *   <li>Update group / image → OWNER or ADMIN</li>
 *   <li>Approve / reject / remove member → OWNER or ADMIN</li>
 *   <li>Promote to ADMIN → OWNER only</li>
 *   <li>Transfer ownership → OWNER only</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {

    private final StudyGroupRepository  groupRepository;
    private final GroupMemberRepository memberRepository;
    private final GroupJoinRequestRepository joinRequestRepository;
    private final UserRepository userRepository;
    private final GroupMessageRepository groupMessageRepository;
    private final GroupMessageReadRepository groupMessageReadRepository;
    private final NotificationService notificationService;

    // =========================================================================
    // Group CRUD
    // =========================================================================

    @Override
    @Transactional
    public GroupResponse createGroup(CreateGroupRequest request) {
        User creator = resolveCurrentUser();

        StudyGroup group = StudyGroup.builder()
                .name(request.name())
                .description(request.description())
                .topic(request.topic())
                .isPrivate(request.isPrivate())
                .memberCount(1)
                .build();
        group = groupRepository.save(group);

        // Register creator as OWNER
        GroupMember ownerMember = GroupMember.builder()
                .group(group)
                .user(creator)
                .role(GroupRole.OWNER)
                .build();
        memberRepository.save(ownerMember);

        log.info("Group '{}' created by user {}", group.getName(), creator.getId());
        return toGroupResponse(group, GroupRole.OWNER);
    }

    @Override
    @Transactional
    public GroupResponse updateGroup(Long groupId, UpdateGroupRequest request) {
        StudyGroup group = findGroup(groupId);
        requireOwnerOrAdmin(group, resolveCurrentUser());

        if (request.name() != null)        group.setName(request.name());
        if (request.description() != null) group.setDescription(request.description());
        if (request.topic() != null)       group.setTopic(request.topic());
        if (request.isPrivate() != null)   group.setPrivate(request.isPrivate());

        group = groupRepository.save(group);
        GroupRole myRole = resolveMyRole(group);
        return toGroupResponse(group, myRole);
    }

    @Override
    @Transactional
    public void deleteGroup(Long groupId) {
        StudyGroup group = findGroup(groupId);
        requireOwner(group, resolveCurrentUser());

        // 1. Delete read receipts first (FK → group_messages)
        groupMessageReadRepository.deleteAllByGroupId(groupId);

        // 2. Delete group messages (FK → study_groups)
        groupMessageRepository.deleteAllByGroupId(groupId);

        // 3. Delete all join requests
        joinRequestRepository.deleteAllByGroupId(groupId);

        // 4. Delete all memberships
        memberRepository.deleteAllByGroupId(groupId);

        // 5. Delete the group itself
        groupRepository.delete(group);
        log.info("Group {} deleted with all associated data", groupId);
    }

    @Override
    @Transactional
    public GroupResponse updateGroupImage(Long groupId, String imageUrl, String publicId) {
        StudyGroup group = findGroup(groupId);
        requireOwnerOrAdmin(group, resolveCurrentUser());

        group.setImageUrl(imageUrl);
        group.setImagePublicId(publicId);
        group = groupRepository.save(group);

        GroupRole myRole = resolveMyRole(group);
        return toGroupResponse(group, myRole);
    }

    // =========================================================================
    // Discovery
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public GroupResponse getGroup(Long groupId) {
        StudyGroup group = findGroup(groupId);
        GroupRole myRole = resolveMyRole(group);
        return toGroupResponse(group, myRole);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupResponse> listGroups(Pageable pageable) {
        return groupRepository.findAllOrderByMemberCount(pageable)
                .map(g -> toGroupResponse(g, resolveMyRole(g)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupResponse> searchGroups(String keyword, Pageable pageable) {
        return groupRepository.search(keyword, pageable)
                .map(g -> toGroupResponse(g, resolveMyRole(g)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupResponse> getMyGroups(Pageable pageable) {
        User me = resolveCurrentUser();
        return groupRepository.findByMember(me.getId(), pageable)
                .map(g -> toGroupResponse(g, resolveMyRole(g)));
    }

    // =========================================================================
    // Membership
    // =========================================================================

    @Override
    @Transactional
    public GroupMemberResponse joinGroup(Long groupId) {
        StudyGroup group = findGroup(groupId);
        User user = resolveCurrentUser();

        if (group.isPrivate()) {
            throw new BadRequestException(
                    "This group is private. Submit a join request instead.");
        }
        if (memberRepository.existsByGroupIdAndUserId(groupId, user.getId())) {
            throw new BadRequestException("You are already a member of this group");
        }

        GroupMember member = GroupMember.builder()
                .group(group)
                .user(user)
                .role(GroupRole.MEMBER)
                .build();
        member = memberRepository.save(member);

        group.setMemberCount(group.getMemberCount() + 1);
        groupRepository.save(group);

        return toMemberResponse(member);
    }

    @Override
    @Transactional
    public void leaveGroup(Long groupId) {
        StudyGroup group = findGroup(groupId);
        User user = resolveCurrentUser();

        GroupMember membership = memberRepository.findByGroupIdAndUserId(groupId, user.getId())
                .orElseThrow(() -> new BadRequestException("You are not a member of this group"));

        if (membership.getRole() == GroupRole.OWNER) {
            throw new BadRequestException(
                    "As the OWNER you must transfer ownership before leaving the group");
        }

        memberRepository.delete(membership);
        group.setMemberCount(Math.max(0, group.getMemberCount() - 1));
        groupRepository.save(group);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupMemberResponse> getMembers(Long groupId, Pageable pageable) {
        findGroup(groupId); // existence check
        return memberRepository.findByGroupIdOrderByJoinedAtAsc(groupId, pageable)
                .map(this::toMemberResponse);
    }

    @Override
    @Transactional
    public void removeMember(Long groupId, Long memberId) {
        StudyGroup group = findGroup(groupId);
        User actor = resolveCurrentUser();
        requireOwnerOrAdmin(group, actor);

        GroupMember target = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member record not found"));

        if (!target.getGroup().getId().equals(groupId)) {
            throw new BadRequestException("Member does not belong to this group");
        }
        if (target.getRole() == GroupRole.OWNER) {
            throw new BadRequestException("The OWNER cannot be removed");
        }
        // ADMIN cannot remove another ADMIN — only OWNER can
        GroupMember actorMembership = memberRepository.findByGroupIdAndUserId(groupId, actor.getId())
                .orElseThrow(() -> new UnauthorizedException("Not a member of this group"));
        if (actorMembership.getRole() == GroupRole.ADMIN && target.getRole() == GroupRole.ADMIN) {
            throw new UnauthorizedException("Only the OWNER can remove an ADMIN");
        }

        memberRepository.delete(target);
        group.setMemberCount(Math.max(0, group.getMemberCount() - 1));
        groupRepository.save(group);

        // Notify the removed member
        try {
            notificationService.createNotification(
                    target.getUser(), actor,
                    NotificationType.GROUP_KICKED,
                    "You have been removed from the group '" + group.getName() + "'",
                    "GROUP", groupId
            );
        } catch (Exception ex) {
            log.warn("Failed to send kick notification", ex);
        }
    }

    @Override
    @Transactional
    public GroupMemberResponse promoteToAdmin(Long groupId, Long memberId) {
        StudyGroup group = findGroup(groupId);
        requireOwner(group, resolveCurrentUser());

        GroupMember target = findMemberInGroup(memberId, groupId);
        if (target.getRole() != GroupRole.MEMBER) {
            throw new BadRequestException("Only a MEMBER can be promoted to ADMIN");
        }
        target.setRole(GroupRole.ADMIN);
        GroupMemberResponse result = toMemberResponse(memberRepository.save(target));

        // Notify the promoted member
        User actorUser = resolveCurrentUser();
        try {
            notificationService.createNotification(
                    target.getUser(), actorUser,
                    NotificationType.GROUP_OWNERSHIP_TRANSFERRED,
                    "You have been promoted to Admin in '" + group.getName() + "'",
                    "GROUP", groupId
            );
        } catch (Exception ex) {
            log.warn("Failed to send promotion notification", ex);
        }
        return result;
    }

    @Override
    @Transactional
    public GroupMemberResponse transferOwnership(Long groupId, Long memberId) {
        StudyGroup group = findGroup(groupId);
        User currentOwnerUser = resolveCurrentUser();
        requireOwner(group, currentOwnerUser);

        GroupMember newOwnerMember = findMemberInGroup(memberId, groupId);
        if (newOwnerMember.getUser().getId().equals(currentOwnerUser.getId())) {
            throw new BadRequestException("You are already the owner");
        }

        // Current OWNER → ADMIN
        GroupMember currentOwnerMember = memberRepository
                .findByGroupIdAndUserId(groupId, currentOwnerUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner membership not found"));
        currentOwnerMember.setRole(GroupRole.ADMIN);
        memberRepository.save(currentOwnerMember);

        // Target member → OWNER
        newOwnerMember.setRole(GroupRole.OWNER);
        GroupMemberResponse result = toMemberResponse(memberRepository.save(newOwnerMember));

        // Notify the new owner
        try {
            notificationService.createNotification(
                    newOwnerMember.getUser(), currentOwnerUser,
                    NotificationType.GROUP_OWNERSHIP_TRANSFERRED,
                    "Ownership of '" + group.getName() + "' has been transferred to you",
                    "GROUP", groupId
            );
        } catch (Exception ex) {
            log.warn("Failed to send ownership transfer notification", ex);
        }
        return result;
    }

    // =========================================================================
    // Join Requests
    // =========================================================================

    @Override
    @Transactional
    public JoinRequestResponse requestToJoin(Long groupId, JoinRequestBody body) {
        StudyGroup group = findGroup(groupId);
        User requester = resolveCurrentUser();

        if (!group.isPrivate()) {
            throw new BadRequestException(
                    "This group is open. Use the join endpoint instead.");
        }
        if (memberRepository.existsByGroupIdAndUserId(groupId, requester.getId())) {
            throw new BadRequestException("You are already a member of this group");
        }

        joinRequestRepository.findByGroupIdAndRequesterId(groupId, requester.getId())
                .ifPresent(existing -> {
                    if (existing.getStatus() == JoinRequestStatus.PENDING) {
                        throw new BadRequestException("You already have a pending join request");
                    }
                    if (existing.getStatus() == JoinRequestStatus.APPROVED) {
                        throw new BadRequestException("Your previous request was already approved");
                    }
                    // REJECTED: delete old request so a new one can be created
                    joinRequestRepository.delete(existing);
                });

        GroupJoinRequest joinRequest = GroupJoinRequest.builder()
                .group(group)
                .requester(requester)
                .message(body != null ? body.message() : null)
                .status(JoinRequestStatus.PENDING)
                .build();
        joinRequest = joinRequestRepository.save(joinRequest);
        final Long savedJoinRequestId = joinRequest.getId();

        // Notify OWNER and ADMINs about the new join request
        try {
            memberRepository.findByGroupIdAndRole(groupId, GroupRole.OWNER)
                    .forEach(ownerMember -> notificationService.createNotification(
                            ownerMember.getUser(), requester,
                            NotificationType.GROUP_JOIN_REQUEST,
                            requester.getName() + " requested to join '" + group.getName() + "'",
                            "GROUP_JOIN_REQUEST", savedJoinRequestId
                    ));
            memberRepository.findByGroupIdAndRole(groupId, GroupRole.ADMIN)
                    .forEach(adminMember -> notificationService.createNotification(
                            adminMember.getUser(), requester,
                            NotificationType.GROUP_JOIN_REQUEST,
                            requester.getName() + " requested to join '" + group.getName() + "'",
                            "GROUP_JOIN_REQUEST", savedJoinRequestId
                    ));
        } catch (Exception ex) {
            log.warn("Failed to send join request notifications", ex);
        }

        return toJoinRequestResponse(joinRequest);
    }

    @Override
    @Transactional
    public JoinRequestResponse approveRequest(Long groupId, Long requestId) {
        StudyGroup group = findGroup(groupId);
        User actor = resolveCurrentUser();
        requireOwnerOrAdmin(group, actor);

        GroupJoinRequest joinRequest = findPendingRequest(requestId, groupId);

        // Create membership
        if (!memberRepository.existsByGroupIdAndUserId(groupId, joinRequest.getRequester().getId())) {
            GroupMember newMember = GroupMember.builder()
                    .group(group)
                    .user(joinRequest.getRequester())
                    .role(GroupRole.MEMBER)
                    .build();
            memberRepository.save(newMember);
            group.setMemberCount(group.getMemberCount() + 1);
            groupRepository.save(group);
        }

        joinRequest.setStatus(JoinRequestStatus.APPROVED);
        joinRequest.setReviewedBy(actor);
        joinRequest.setReviewedAt(Instant.now());
        JoinRequestResponse result = toJoinRequestResponse(joinRequestRepository.save(joinRequest));

        // Notify the applicant their request was approved
        try {
            notificationService.createNotification(
                    joinRequest.getRequester(), actor,
                    NotificationType.GROUP_JOIN_APPROVED,
                    "Your request to join '" + group.getName() + "' was approved!",
                    "GROUP", groupId
            );
        } catch (Exception ex) {
            log.warn("Failed to send approval notification", ex);
        }
        return result;
    }

    @Override
    @Transactional
    public JoinRequestResponse rejectRequest(Long groupId, Long requestId) {
        StudyGroup group = findGroup(groupId);
        User actor = resolveCurrentUser();
        requireOwnerOrAdmin(group, actor);

        GroupJoinRequest joinRequest = findPendingRequest(requestId, groupId);
        joinRequest.setStatus(JoinRequestStatus.REJECTED);
        joinRequest.setReviewedBy(actor);
        joinRequest.setReviewedAt(Instant.now());
        JoinRequestResponse result = toJoinRequestResponse(joinRequestRepository.save(joinRequest));

        // Notify the applicant their request was rejected
        try {
            notificationService.createNotification(
                    joinRequest.getRequester(), actor,
                    NotificationType.GROUP_JOIN_REJECTED,
                    "Your request to join '" + group.getName() + "' was declined.",
                    "GROUP", groupId
            );
        } catch (Exception ex) {
            log.warn("Failed to send rejection notification", ex);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JoinRequestResponse> getPendingRequests(Long groupId, Pageable pageable) {
        StudyGroup group = findGroup(groupId);
        requireOwnerOrAdmin(group, resolveCurrentUser());

        return joinRequestRepository.findByGroupIdAndStatusOrderByCreatedAtAsc(
                groupId, JoinRequestStatus.PENDING, pageable
        ).map(this::toJoinRequestResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JoinRequestResponse> getMyRequests(Pageable pageable) {
        User me = resolveCurrentUser();
        return joinRequestRepository.findByRequesterIdOrderByCreatedAtDesc(me.getId(), pageable)
                .map(this::toJoinRequestResponse);
    }

    // =========================================================================
    // Private helpers – authorization
    // =========================================================================

    /** Throws {@link UnauthorizedException} if the user is not OWNER or ADMIN. */
    private void requireOwnerOrAdmin(StudyGroup group, User user) {
        GroupMember membership = memberRepository.findByGroupIdAndUserId(group.getId(), user.getId())
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this group"));
        if (membership.getRole() == GroupRole.MEMBER) {
            throw new UnauthorizedException("Only OWNER or ADMIN can perform this action");
        }
    }

    /** Throws {@link UnauthorizedException} if the user is not the OWNER. */
    private void requireOwner(StudyGroup group, User user) {
        GroupMember membership = memberRepository.findByGroupIdAndUserId(group.getId(), user.getId())
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this group"));
        if (membership.getRole() != GroupRole.OWNER) {
            throw new UnauthorizedException("Only the OWNER can perform this action");
        }
    }

    // =========================================================================
    // Private helpers – resolution
    // =========================================================================

    private StudyGroup findGroup(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Study group not found: " + groupId));
    }

    private GroupMember findMemberInGroup(Long memberId, Long groupId) {
        GroupMember m = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member record not found: " + memberId));
        if (!m.getGroup().getId().equals(groupId)) {
            throw new BadRequestException("Member does not belong to this group");
        }
        return m;
    }

    private GroupJoinRequest findPendingRequest(Long requestId, Long groupId) {
        GroupJoinRequest jr = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found: " + requestId));
        if (!jr.getGroup().getId().equals(groupId)) {
            throw new BadRequestException("Request does not belong to this group");
        }
        if (jr.getStatus() != JoinRequestStatus.PENDING) {
            throw new BadRequestException("Join request is no longer pending");
        }
        return jr;
    }

    private User resolveCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl details) {
            return userRepository.findById(details.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        throw new UnauthorizedException("Unauthorized");
    }

    /**
     * Resolves the current user's role in a group; returns {@code null} if not a member.
     * Avoids a DB hit if the user is not authenticated (e.g. anonymous listing).
     */
    private GroupRole resolveMyRole(StudyGroup group) {
        try {
            User me = resolveCurrentUser();
            return memberRepository.findByGroupIdAndUserId(group.getId(), me.getId())
                    .map(GroupMember::getRole)
                    .orElse(null);
        } catch (Exception ignored) {
            return null;
        }
    }

    // =========================================================================
    // Private helpers – mapping
    // =========================================================================

    private GroupResponse toGroupResponse(StudyGroup g, GroupRole myRole) {
        // Resolve the owner's user info
        GroupMember ownerMember = memberRepository.findOwner(g.getId()).orElse(null);
        Long ownerId   = ownerMember != null ? ownerMember.getUser().getId()   : null;
        String ownerName = ownerMember != null ? ownerMember.getUser().getName() : null;

        return GroupResponse.builder()
                .id(g.getId())
                .name(g.getName())
                .description(g.getDescription())
                .topic(g.getTopic())
                .imageUrl(g.getImageUrl())
                .isPrivate(g.isPrivate())
                .memberCount(g.getMemberCount())
                .myRole(myRole)
                .ownerId(ownerId)
                .ownerName(ownerName)
                .createdAt(g.getCreatedAt())
                .build();
    }

    private GroupMemberResponse toMemberResponse(GroupMember m) {
        return GroupMemberResponse.builder()
                .memberId(m.getId())
                .userId(m.getUser().getId())
                .userName(m.getUser().getName())
                .userEmail(m.getUser().getEmail())
                .role(m.getRole())
                .joinedAt(m.getJoinedAt())
                .build();
    }

    private JoinRequestResponse toJoinRequestResponse(GroupJoinRequest jr) {
        return JoinRequestResponse.builder()
                .id(jr.getId())
                .groupId(jr.getGroup().getId())
                .groupName(jr.getGroup().getName())
                .requesterId(jr.getRequester().getId())
                .requesterName(jr.getRequester().getName())
                .requesterEmail(jr.getRequester().getEmail())
                .message(jr.getMessage())
                .status(jr.getStatus())
                .createdAt(jr.getCreatedAt())
                .reviewedAt(jr.getReviewedAt())
                .build();
    }
}
