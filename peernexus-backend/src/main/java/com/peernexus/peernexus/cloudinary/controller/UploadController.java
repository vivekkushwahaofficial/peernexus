package com.peernexus.peernexus.cloudinary.controller;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.peernexus.peernexus.cloudinary.service.CloudinaryService;
import com.peernexus.peernexus.cloudinary.service.CloudinaryService.UploadResult;
import com.peernexus.peernexus.common.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * REST controller for uploading media assets to Cloudinary.
 *
 * <p>All endpoints require an authenticated user (enforced by Spring Security).
 * Each endpoint accepts a {@code multipart/form-data} request with a single
 * {@code file} part and returns the Cloudinary {@code secure_url} (HTTPS) that
 * the client should store and display.  Only the URL is persisted in MySQL;
 * binary data is never stored in the database.
 *
 * <h2>Endpoints</h2>
 * <pre>
 * POST /api/upload/profile-picture/{userId}   – user avatar
 * POST /api/upload/doubt-image/{doubtId}      – image on a doubt post
 * POST /api/upload/chat-media/{chatRoomId}    – media in a chat room
 * POST /api/upload/group-image/{groupId}      – group cover / avatar
 * </pre>
 */
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;

    // -------------------------------------------------------------------------
    // Profile Pictures
    // -------------------------------------------------------------------------

    /**
     * Uploads a profile picture for the specified user.
     *
     * <p>If a picture already exists for this user it is overwritten on Cloudinary
     * (same public_id, new binary).
     *
     * @param userId the ID of the user whose picture is being updated
     * @param file   the image file (PNG, JPG, WEBP, etc.)
     * @return {@link ApiResponse} containing the secure URL and public_id
     */
    @PostMapping(
            value    = "/profile-picture/{userId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<UploadResult>> uploadProfilePicture(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        UploadResult result = cloudinaryService.uploadProfilePicture(file, userId);
        return ResponseEntity.ok(ApiResponse.<UploadResult>builder()
                .success(true)
                .message("Profile picture uploaded successfully")
                .data(result)
                .build());
    }

    // -------------------------------------------------------------------------
    // Doubt Images
    // -------------------------------------------------------------------------

    /**
     * Uploads an image to be attached to a doubt post.
     *
     * @param doubtId the ID of the doubt the image belongs to
     * @param file    the image file
     * @return {@link ApiResponse} containing the secure URL and public_id
     */
    @PostMapping(
            value    = "/doubt-image/{doubtId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<UploadResult>> uploadDoubtImage(
            @PathVariable Long doubtId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        UploadResult result = cloudinaryService.uploadDoubtImage(file, doubtId);
        return ResponseEntity.ok(ApiResponse.<UploadResult>builder()
                .success(true)
                .message("Doubt image uploaded successfully")
                .data(result)
                .build());
    }

    // -------------------------------------------------------------------------
    // Chat Media
    // -------------------------------------------------------------------------

    /**
     * Uploads a media file shared inside a chat room.
     *
     * @param chatRoomId the ID of the chat room
     * @param file       the image or file to upload
     * @return {@link ApiResponse} containing the secure URL and public_id
     */
    @PostMapping(
            value    = "/chat-media/{chatRoomId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<UploadResult>> uploadChatMedia(
            @PathVariable Long chatRoomId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        validateChatFile(file);
        verifyFileSignature(file);

        UploadResult result = cloudinaryService.uploadChatMedia(file, chatRoomId);
        return ResponseEntity.ok(ApiResponse.<UploadResult>builder()
                .success(true)
                .message("Chat media uploaded successfully")
                .data(result)
                .build());
    }

    private void validateChatFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        String mimeType = file.getContentType();
        if (mimeType == null) {
            throw new IllegalArgumentException("Invalid file type");
        }
        boolean isAllowed = mimeType.equals("application/pdf")
                || mimeType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                || mimeType.equals("application/vnd.openxmlformats-officedocument.presentationml.presentation")
                || mimeType.startsWith("image/");

        if (!isAllowed) {
            throw new IllegalArgumentException("File type not allowed. Supported formats: PDF, DOCX, PPTX, JPG, PNG, WEBP");
        }
    }

    private void verifyFileSignature(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        if (bytes.length >= 2) {
            // Rejects MZ header (Windows executable)
            if (bytes[0] == 0x4D && bytes[1] == 0x5A) {
                throw new IllegalArgumentException("File signature verification failed: executables are blocked");
            }
        }
    }

    // -------------------------------------------------------------------------
    // Group Images
    // -------------------------------------------------------------------------

    /**
     * Uploads a cover or avatar image for a group.
     *
     * @param groupId the ID of the group
     * @param file    the image file
     * @return {@link ApiResponse} containing the secure URL and public_id
     */
    @PostMapping(
            value    = "/group-image/{groupId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<UploadResult>> uploadGroupImage(
            @PathVariable Long groupId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        UploadResult result = cloudinaryService.uploadGroupImage(file, groupId);
        return ResponseEntity.ok(ApiResponse.<UploadResult>builder()
                .success(true)
                .message("Group image uploaded successfully")
                .data(result)
                .build());
    }
}
