package com.peernexus.peernexus.cloudinary.controller;

import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.peernexus.peernexus.cloudinary.service.CloudinaryService;
import com.peernexus.peernexus.common.ApiResponse;
import com.peernexus.peernexus.exception.UnauthorizedException;
import com.peernexus.peernexus.user.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for deleting media assets from Cloudinary.
 *
 * <h2>Security</h2>
 * Deletion is protected by ownership verification:
 * <ul>
 *   <li>The {@code publicId} must begin with {@code peernexus/} — prevents
 *       path-traversal attacks that could delete arbitrary Cloudinary assets.</li>
 *   <li>User-specific assets (e.g. {@code peernexus/profile-pictures/user-7}) can only
 *       be deleted by the owner (user-id matches) or an ADMIN/MODERATOR.</li>
 *   <li>Shared/entity assets (doubt-images, chat-media, group-images) require
 *       ADMIN or MODERATOR role — ownership of the entity is enforced at the
 *       service layer of the owning module (not here).</li>
 * </ul>
 *
 * <h2>Endpoint</h2>
 * <pre>
 * DELETE /api/media?publicId={publicId}
 * </pre>
 */
@Slf4j
@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class DeleteController {

    /** All PeerNexus assets must live under this root prefix on Cloudinary. */
    private static final String PEERNEXUS_ROOT = "peernexus/";

    /** Sub-prefix for profile pictures (owner-deletable). */
    private static final String PROFILE_PREFIX = "peernexus/profile-pictures/user-";

    private final CloudinaryService cloudinaryService;

    /**
     * Deletes a Cloudinary asset by its {@code public_id}.
     *
     * <p>Access rules (enforced before the Cloudinary API is called):
     * <ol>
     *   <li>The {@code publicId} MUST start with {@code peernexus/}.</li>
     *   <li>If it is a <em>profile picture</em> ({@code peernexus/profile-pictures/user-{id}}),
     *       the caller must either be the owner (their ID matches) or hold
     *       MODERATOR / ADMIN role.</li>
     *   <li>All other asset types require MODERATOR or ADMIN role directly.</li>
     * </ol>
     *
     * @param publicId  the Cloudinary public_id of the asset to permanently delete
     * @param principal the authenticated user (injected by Spring Security)
     * @return {@link ApiResponse} with {@code success=true} on successful deletion
     * @throws UnauthorizedException if the caller does not have permission to delete this asset
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteMedia(
            @RequestParam("publicId") String publicId,
            @AuthenticationPrincipal UserDetailsImpl principal
    ) throws IOException {

        validateOwnership(publicId, principal);

        log.info("User {} deleting Cloudinary asset: {}", principal.getId(), publicId);
        cloudinaryService.delete(publicId);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Media deleted successfully")
                .data(null)
                .build());
    }

    // ── Moderation / Admin bypass endpoints ───────────────────────────────────

    /**
     * Force-deletes any PeerNexus Cloudinary asset.
     * Requires MODERATOR or ADMIN role — used when moderating reported content.
     *
     * @param publicId  the Cloudinary public_id of the asset
     * @param principal the authenticated moderator/admin
     * @return {@link ApiResponse} with {@code success=true}
     */
    @DeleteMapping("/force")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> forceDeleteMedia(
            @RequestParam("publicId") String publicId,
            @AuthenticationPrincipal UserDetailsImpl principal
    ) throws IOException {

        // Still enforce that the asset belongs to PeerNexus
        if (!publicId.startsWith(PEERNEXUS_ROOT)) {
            throw new UnauthorizedException("publicId must belong to the peernexus/ namespace");
        }

        log.info("Moderator/Admin {} force-deleting Cloudinary asset: {}", principal.getId(), publicId);
        cloudinaryService.delete(publicId);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Media force-deleted successfully")
                .data(null)
                .build());
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Validates that the caller is authorised to delete the given asset.
     *
     * <p>Rules:
     * <ol>
     *   <li>The {@code publicId} must begin with {@code peernexus/}.</li>
     *   <li>ADMIN and MODERATOR roles may delete any PeerNexus asset.</li>
     *   <li>Regular users may only delete their own profile picture
     *       ({@code peernexus/profile-pictures/user-{their-id}}).</li>
     * </ol>
     *
     * @throws UnauthorizedException if access is denied
     */
    private void validateOwnership(String publicId, UserDetailsImpl principal) {
        // Rule 1: must be under the PeerNexus namespace
        if (!publicId.startsWith(PEERNEXUS_ROOT)) {
            throw new UnauthorizedException("publicId must belong to the peernexus/ namespace");
        }

        boolean isPrivileged = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                            || a.getAuthority().equals("ROLE_MODERATOR"));

        // Rule 2: admins/moderators can delete anything under peernexus/
        if (isPrivileged) {
            return;
        }

        // Rule 3: regular users can only delete their own profile picture
        String ownedPrefix = PROFILE_PREFIX + principal.getId();
        if (publicId.startsWith(ownedPrefix)) {
            return;
        }

        // All other cases are forbidden
        log.warn("User {} attempted to delete unauthorized asset: {}", principal.getId(), publicId);
        throw new UnauthorizedException(
                "You do not have permission to delete this asset. " +
                "Only the owner, an admin, or a moderator may delete Cloudinary media.");
    }
}
