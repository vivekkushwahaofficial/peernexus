package com.peernexus.peernexus.group.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.peernexus.peernexus.cloudinary.service.CloudinaryService;
import com.peernexus.peernexus.cloudinary.service.CloudinaryService.UploadResult;
import com.peernexus.peernexus.common.ApiResponse;
import com.peernexus.peernexus.group.dto.CreateGroupRequest;
import com.peernexus.peernexus.group.dto.GroupMemberResponse;
import com.peernexus.peernexus.group.dto.GroupResponse;
import com.peernexus.peernexus.group.dto.JoinRequestBody;
import com.peernexus.peernexus.group.dto.JoinRequestResponse;
import com.peernexus.peernexus.group.dto.UpdateGroupRequest;
import com.peernexus.peernexus.group.service.GroupService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.io.IOException;

/**
 * REST controller for the Study Group module.
 *
 * <p>All mutating endpoints require an authenticated user.
 * Read-only discovery endpoints (list, search, get) are publicly accessible.
 *
 * <h2>Base URL: {@code /api/groups}</h2>
 *
 * <h3>Group management</h3>
 * <pre>
 * POST   /api/groups                            – create group
 * GET    /api/groups                            – list all groups (trending)
 * GET    /api/groups/search?q=keyword           – search by name / topic
 * GET    /api/groups/me                         – my groups
 * GET    /api/groups/{id}                       – get single group
 * PUT    /api/groups/{id}                       – update group (OWNER/ADMIN)
 * DELETE /api/groups/{id}                       – delete group (OWNER)
 * POST   /api/groups/{id}/image                 – upload group image (OWNER/ADMIN)
 * </pre>
 *
 * <h3>Membership</h3>
 * <pre>
 * POST   /api/groups/{id}/join                  – join open group
 * DELETE /api/groups/{id}/leave                 – leave group
 * GET    /api/groups/{id}/members               – list members
 * DELETE /api/groups/{id}/members/{memberId}    – remove member (OWNER/ADMIN)
 * PUT    /api/groups/{id}/members/{memberId}/promote  – promote to ADMIN (OWNER)
 * PUT    /api/groups/{id}/members/{memberId}/transfer – transfer ownership (OWNER)
 * </pre>
 *
 * <h3>Join Requests (private groups)</h3>
 * <pre>
 * POST   /api/groups/{id}/join-requests              – submit request
 * GET    /api/groups/{id}/join-requests              – list pending (OWNER/ADMIN)
 * PUT    /api/groups/{id}/join-requests/{rid}/approve – approve (OWNER/ADMIN)
 * PUT    /api/groups/{id}/join-requests/{rid}/reject  – reject  (OWNER/ADMIN)
 * GET    /api/groups/join-requests/me                – my own request history
 * </pre>
 */
@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@Validated
public class GroupController {

    private final GroupService groupService;
    private final CloudinaryService cloudinaryService;

    // =========================================================================
    // Group CRUD
    // =========================================================================

    @PostMapping
    public ResponseEntity<ApiResponse<GroupResponse>> createGroup(
            @Valid @RequestBody CreateGroupRequest request
    ) {
        GroupResponse response = groupService.createGroup(request);
        return ResponseEntity.ok(ApiResponse.<GroupResponse>builder()
                .success(true)
                .message("Group created")
                .data(response)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<GroupResponse>>> listGroups(Pageable pageable) {
        Page<GroupResponse> response = groupService.listGroups(pageable);
        return ResponseEntity.ok(ApiResponse.<Page<GroupResponse>>builder()
                .success(true)
                .message("Groups")
                .data(response)
                .build());
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<GroupResponse>>> searchGroups(
            @RequestParam("q") String keyword,
            Pageable pageable
    ) {
        Page<GroupResponse> response = groupService.searchGroups(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<GroupResponse>>builder()
                .success(true)
                .message("Search results")
                .data(response)
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<GroupResponse>>> getMyGroups(Pageable pageable) {
        Page<GroupResponse> response = groupService.getMyGroups(pageable);
        return ResponseEntity.ok(ApiResponse.<Page<GroupResponse>>builder()
                .success(true)
                .message("My groups")
                .data(response)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GroupResponse>> getGroup(@PathVariable Long id) {
        GroupResponse response = groupService.getGroup(id);
        return ResponseEntity.ok(ApiResponse.<GroupResponse>builder()
                .success(true)
                .message("Group")
                .data(response)
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GroupResponse>> updateGroup(
            @PathVariable Long id,
            @Valid @RequestBody UpdateGroupRequest request
    ) {
        GroupResponse response = groupService.updateGroup(id, request);
        return ResponseEntity.ok(ApiResponse.<GroupResponse>builder()
                .success(true)
                .message("Group updated")
                .data(response)
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGroup(@PathVariable Long id) {
        groupService.deleteGroup(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Group deleted")
                .data(null)
                .build());
    }

    /**
     * Uploads a new group image to Cloudinary and updates the group record.
     * Accepts {@code multipart/form-data} with a {@code file} part.
     */
    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<GroupResponse>> uploadGroupImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        UploadResult upload = cloudinaryService.uploadGroupImage(file, id);
        GroupResponse response = groupService.updateGroupImage(id, upload.secureUrl(), upload.publicId());
        return ResponseEntity.ok(ApiResponse.<GroupResponse>builder()
                .success(true)
                .message("Group image updated")
                .data(response)
                .build());
    }

    // =========================================================================
    // Membership
    // =========================================================================

    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<GroupMemberResponse>> joinGroup(@PathVariable Long id) {
        GroupMemberResponse response = groupService.joinGroup(id);
        return ResponseEntity.ok(ApiResponse.<GroupMemberResponse>builder()
                .success(true)
                .message("Joined group")
                .data(response)
                .build());
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveGroup(@PathVariable Long id) {
        groupService.leaveGroup(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Left group")
                .data(null)
                .build());
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<Page<GroupMemberResponse>>> getMembers(
            @PathVariable Long id,
            Pageable pageable
    ) {
        Page<GroupMemberResponse> response = groupService.getMembers(id, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<GroupMemberResponse>>builder()
                .success(true)
                .message("Members")
                .data(response)
                .build());
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long id,
            @PathVariable Long memberId
    ) {
        groupService.removeMember(id, memberId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Member removed")
                .data(null)
                .build());
    }

    @PutMapping("/{id}/members/{memberId}/promote")
    public ResponseEntity<ApiResponse<GroupMemberResponse>> promoteToAdmin(
            @PathVariable Long id,
            @PathVariable Long memberId
    ) {
        GroupMemberResponse response = groupService.promoteToAdmin(id, memberId);
        return ResponseEntity.ok(ApiResponse.<GroupMemberResponse>builder()
                .success(true)
                .message("Member promoted to ADMIN")
                .data(response)
                .build());
    }

    @PutMapping("/{id}/members/{memberId}/transfer")
    public ResponseEntity<ApiResponse<GroupMemberResponse>> transferOwnership(
            @PathVariable Long id,
            @PathVariable Long memberId
    ) {
        GroupMemberResponse response = groupService.transferOwnership(id, memberId);
        return ResponseEntity.ok(ApiResponse.<GroupMemberResponse>builder()
                .success(true)
                .message("Ownership transferred")
                .data(response)
                .build());
    }

    // =========================================================================
    // Join Requests
    // =========================================================================

    @PostMapping("/{id}/join-requests")
    public ResponseEntity<ApiResponse<JoinRequestResponse>> requestToJoin(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) JoinRequestBody body
    ) {
        JoinRequestResponse response = groupService.requestToJoin(id, body);
        return ResponseEntity.ok(ApiResponse.<JoinRequestResponse>builder()
                .success(true)
                .message("Join request submitted")
                .data(response)
                .build());
    }

    @GetMapping("/{id}/join-requests")
    public ResponseEntity<ApiResponse<Page<JoinRequestResponse>>> getPendingRequests(
            @PathVariable Long id,
            Pageable pageable
    ) {
        Page<JoinRequestResponse> response = groupService.getPendingRequests(id, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<JoinRequestResponse>>builder()
                .success(true)
                .message("Pending join requests")
                .data(response)
                .build());
    }

    @PutMapping("/{id}/join-requests/{requestId}/approve")
    public ResponseEntity<ApiResponse<JoinRequestResponse>> approveRequest(
            @PathVariable Long id,
            @PathVariable Long requestId
    ) {
        JoinRequestResponse response = groupService.approveRequest(id, requestId);
        return ResponseEntity.ok(ApiResponse.<JoinRequestResponse>builder()
                .success(true)
                .message("Join request approved")
                .data(response)
                .build());
    }

    @PutMapping("/{id}/join-requests/{requestId}/reject")
    public ResponseEntity<ApiResponse<JoinRequestResponse>> rejectRequest(
            @PathVariable Long id,
            @PathVariable Long requestId
    ) {
        JoinRequestResponse response = groupService.rejectRequest(id, requestId);
        return ResponseEntity.ok(ApiResponse.<JoinRequestResponse>builder()
                .success(true)
                .message("Join request rejected")
                .data(response)
                .build());
    }

    @GetMapping("/join-requests/me")
    public ResponseEntity<ApiResponse<Page<JoinRequestResponse>>> getMyRequests(Pageable pageable) {
        Page<JoinRequestResponse> response = groupService.getMyRequests(pageable);
        return ResponseEntity.ok(ApiResponse.<Page<JoinRequestResponse>>builder()
                .success(true)
                .message("My join requests")
                .data(response)
                .build());
    }
}
