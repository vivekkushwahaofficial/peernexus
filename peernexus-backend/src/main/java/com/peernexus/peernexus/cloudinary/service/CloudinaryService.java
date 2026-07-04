package com.peernexus.peernexus.cloudinary.service;

import java.io.IOException;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * High-level application media service that orchestrates folders and file naming,
 * delegating low-level operations to the injected {@link StorageService} provider.
 *
 * <h2>Folder structure on Storage Provider</h2>
 * <pre>
 * peernexus/
 * ├── profile/  – user avatars
 * ├── doubts/   – images attached to doubts
 * ├── chats/    – images / files shared in chats
 * └── groups/   – group cover/avatar images
 * </pre>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    /** Root folder that groups all PeerNexus assets. */
    private static final String ROOT_FOLDER = "peernexus";

    private final StorageService storageService;

    /**
     * Uploads a user profile picture.
     *
     * @param file the multipart file received from the HTTP request
     * @param userId the owner's user ID
     * @return a {@link UploadResult} containing the secure URL and public_id
     * @throws IOException if the upload fails
     */
    public UploadResult uploadProfilePicture(MultipartFile file, Long userId) throws IOException {
        StorageService.UploadResult result = storageService.upload(file, folder("profile"), "user-" + userId);
        return new UploadResult(result.secureUrl(), result.publicId());
    }

    /**
     * Uploads an image attached to a doubt post.
     *
     * @param file     the multipart file received from the HTTP request
     * @param doubtId  the doubt's ID
     * @return a {@link UploadResult} containing the secure URL and public_id
     * @throws IOException if the upload fails
     */
    public UploadResult uploadDoubtImage(MultipartFile file, Long doubtId) throws IOException {
        String uniqueId = "doubt-" + doubtId + "-" + java.util.UUID.randomUUID().toString();
        StorageService.UploadResult result = storageService.upload(file, folder("doubts"), uniqueId);
        return new UploadResult(result.secureUrl(), result.publicId());
    }

    /**
     * Uploads a media file shared inside a chat conversation.
     *
     * @param file       the multipart file received from the HTTP request
     * @param chatRoomId the chat room's ID
     * @return a {@link UploadResult} containing the secure URL and public_id
     * @throws IOException if the upload fails
     */
    public UploadResult uploadChatMedia(MultipartFile file, Long chatRoomId) throws IOException {
        String uniqueName = "chat-" + chatRoomId + "-" + java.util.UUID.randomUUID().toString();
        StorageService.UploadResult result = storageService.upload(file, folder("chats"), uniqueName);
        return new UploadResult(result.secureUrl(), result.publicId());
    }

    /**
     * Uploads a group cover / avatar image.
     *
     * @param file    the multipart file received from the HTTP request
     * @param groupId the group's ID
     * @return a {@link UploadResult} containing the secure URL and public_id
     * @throws IOException if the upload fails
     */
    public UploadResult uploadGroupImage(MultipartFile file, Long groupId) throws IOException {
        StorageService.UploadResult result = storageService.upload(file, folder("groups"), "group-" + groupId);
        return new UploadResult(result.secureUrl(), result.publicId());
    }

    /**
     * Uploads a general attachment or media file.
     *
     * @param file the file to upload
     * @return a {@link UploadResult} containing the secure URL and public_id
     * @throws IOException if the upload fails
     */
    public UploadResult uploadGeneralFile(MultipartFile file) throws IOException {
        String uniqueId = java.util.UUID.randomUUID().toString();
        StorageService.UploadResult result = storageService.upload(file, folder("general"), uniqueId);
        return new UploadResult(result.secureUrl(), result.publicId());
    }

    /**
     * Permanently deletes an asset using its public_id.
     *
     * @param publicId the public_id of the asset to delete
     * @throws IOException if the deletion API call fails
     */
    public void delete(String publicId) throws IOException {
        log.info("Deleting asset with ID: {}", publicId);
        storageService.delete(publicId);
    }

    /** Builds the folder path under the root folder. */
    private String folder(String subFolder) {
        return ROOT_FOLDER + "/" + subFolder;
    }

    /**
     * Immutable value object returned after a successful upload.
     *
     * @param secureUrl the HTTPS URL of the uploaded asset; store this in the database
     * @param publicId  the public_id; store this if you need to delete later
     */
    public record UploadResult(String secureUrl, String publicId) {}
}
