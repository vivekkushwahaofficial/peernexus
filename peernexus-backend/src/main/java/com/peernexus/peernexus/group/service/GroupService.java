package com.peernexus.peernexus.group.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.peernexus.peernexus.group.dto.CreateGroupRequest;
import com.peernexus.peernexus.group.dto.GroupMemberResponse;
import com.peernexus.peernexus.group.dto.GroupResponse;
import com.peernexus.peernexus.group.dto.JoinRequestBody;
import com.peernexus.peernexus.group.dto.JoinRequestResponse;
import com.peernexus.peernexus.group.dto.UpdateGroupRequest;

/**
 * Business-logic interface for the Study Group module.
 */
public interface GroupService {

    // ── Group CRUD ────────────────────────────────────────────────────────────

    /**
     * Creates a new study group with the authenticated user as OWNER.
     *
     * @param request group creation payload
     * @return the newly created group
     */
    GroupResponse createGroup(CreateGroupRequest request);

    /**
     * Updates the metadata of a group. Only OWNER or ADMIN can call this.
     *
     * @param groupId the group to update
     * @param request fields to update (all optional)
     * @return the updated group
     */
    GroupResponse updateGroup(Long groupId, UpdateGroupRequest request);

    /**
     * Permanently deletes a group and all its members / join requests.
     * Only the OWNER can delete.
     *
     * @param groupId the group to delete
     */
    void deleteGroup(Long groupId);

    /**
     * Updates the group's Cloudinary image URL and public_id.
     * Only OWNER or ADMIN can call this.
     *
     * @param groupId     the group to update
     * @param imageUrl    new Cloudinary HTTPS URL
     * @param publicId    new Cloudinary public_id
     * @return the updated group
     */
    GroupResponse updateGroupImage(Long groupId, String imageUrl, String publicId);

    // ── Discovery ─────────────────────────────────────────────────────────────

    /**
     * Returns a single group by ID. Includes the caller's membership role.
     *
     * @param groupId the group's primary key
     * @return the group response
     */
    GroupResponse getGroup(Long groupId);

    /**
     * Returns all groups in the system ordered by member count (trending).
     *
     * @param pageable pagination params
     * @return page of group responses
     */
    Page<GroupResponse> listGroups(Pageable pageable);

    /**
     * Searches groups by name or topic keyword.
     *
     * @param keyword  search term
     * @param pageable pagination params
     * @return page of matching group responses
     */
    Page<GroupResponse> searchGroups(String keyword, Pageable pageable);

    /**
     * Returns all groups the authenticated user belongs to.
     *
     * @param pageable pagination params
     * @return page of group responses
     */
    Page<GroupResponse> getMyGroups(Pageable pageable);

    // ── Membership ────────────────────────────────────────────────────────────

    /**
     * Joins an open (non-private) group immediately.
     * Throws {@link com.peernexus.peernexus.exception.BadRequestException} if
     * the group is private — use {@link #requestToJoin} instead.
     *
     * @param groupId the group to join
     * @return the new membership record
     */
    GroupMemberResponse joinGroup(Long groupId);

    /**
     * Leaves a group. The OWNER cannot leave unless they first transfer ownership.
     *
     * @param groupId the group to leave
     */
    void leaveGroup(Long groupId);

    /**
     * Returns paginated member list for a group.
     *
     * @param groupId  the group
     * @param pageable pagination params
     * @return page of member responses
     */
    Page<GroupMemberResponse> getMembers(Long groupId, Pageable pageable);

    /**
     * Removes a member from the group.
     * Only OWNER or ADMIN can remove others; an OWNER cannot be removed.
     *
     * @param groupId  the group
     * @param memberId the {@link com.peernexus.peernexus.group.entity.GroupMember} record ID
     */
    void removeMember(Long groupId, Long memberId);

    /**
     * Promotes a MEMBER to ADMIN.
     * Only the OWNER can promote.
     *
     * @param groupId  the group
     * @param memberId the {@link com.peernexus.peernexus.group.entity.GroupMember} record ID
     * @return the updated membership record
     */
    GroupMemberResponse promoteToAdmin(Long groupId, Long memberId);

    /**
     * Transfers OWNER role from the current OWNER to a target member.
     * The current OWNER becomes ADMIN after the transfer.
     *
     * @param groupId  the group
     * @param memberId the {@link com.peernexus.peernexus.group.entity.GroupMember} record ID of the new owner
     * @return the updated target membership record
     */
    GroupMemberResponse transferOwnership(Long groupId, Long memberId);

    // ── Join Requests ─────────────────────────────────────────────────────────

    /**
     * Submits a join request to a private group.
     * An open group is joined directly via {@link #joinGroup}.
     *
     * @param groupId the private group to apply to
     * @param body    optional message to include
     * @return the created join request
     */
    JoinRequestResponse requestToJoin(Long groupId, JoinRequestBody body);

    /**
     * Approves a pending join request and adds the user as a MEMBER.
     * Only OWNER or ADMIN can call this.
     *
     * @param groupId   the group
     * @param requestId the join request ID
     * @return the approved join request
     */
    JoinRequestResponse approveRequest(Long groupId, Long requestId);

    /**
     * Rejects a pending join request.
     * Only OWNER or ADMIN can call this.
     *
     * @param groupId   the group
     * @param requestId the join request ID
     * @return the rejected join request
     */
    JoinRequestResponse rejectRequest(Long groupId, Long requestId);

    /**
     * Lists pending join requests for a group.
     * Only OWNER or ADMIN can call this.
     *
     * @param groupId  the group
     * @param pageable pagination params
     * @return page of pending join requests
     */
    Page<JoinRequestResponse> getPendingRequests(Long groupId, Pageable pageable);

    /**
     * Returns the authenticated user's own join request history.
     *
     * @param pageable pagination params
     * @return page of join requests the caller has submitted
     */
    Page<JoinRequestResponse> getMyRequests(Pageable pageable);
}
