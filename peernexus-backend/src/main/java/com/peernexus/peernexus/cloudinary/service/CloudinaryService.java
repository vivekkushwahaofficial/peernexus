package com.peernexus.peernexus.cloudinary.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service that wraps the Cloudinary Java SDK to upload and delete media files.
 *
 * <h2>Folder structure on Cloudinary</h2>
 * <pre>
 * peernexus/
 * ├── profile-pictures/   – user avatars
 * ├── doubt-images/       – images attached to doubts
 * ├── chat-media/         – images / files shared in chats
 * └── group-images/       – group cover/avatar images
 * </pre>
 *
 * <p>Only the <em>secure HTTPS URL</em> and the <em>public_id</em> are returned
 * to callers; the application stores URLs in MySQL and never stores binary blobs.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    /** Root folder that groups all PeerNexus assets on Cloudinary. */
    private static final String ROOT_FOLDER = "peernexus";

    private final Cloudinary cloudinary;

    // -------------------------------------------------------------------------
    // Public upload methods – one per media category
    // -------------------------------------------------------------------------

    /**
     * Uploads a user profile picture.
     *
     * @param file the multipart file received from the HTTP request
     * @param userId the owner's user ID (used to build a unique public_id)
     * @return a {@link UploadResult} containing the secure URL and public_id
     * @throws IOException if the upload fails
     */
    public UploadResult uploadProfilePicture(MultipartFile file, Long userId) throws IOException {
        return upload(file, folder("profile-pictures"), publicId("profile-pictures", "user-" + userId));
    }

    /**
     * Uploads an image attached to a doubt post.
     *
     * @param file     the multipart file received from the HTTP request
     * @param doubtId  the doubt's ID (used to build a unique public_id)
     * @return a {@link UploadResult} containing the secure URL and public_id
     * @throws IOException if the upload fails
     */
    public UploadResult uploadDoubtImage(MultipartFile file, Long doubtId) throws IOException {
        return upload(file, folder("doubt-images"), publicId("doubt-images", "doubt-" + doubtId));
    }

    /**
     * Uploads a media file shared inside a chat conversation.
     *
     * @param file       the multipart file received from the HTTP request
     * @param chatRoomId the chat room's ID (used to build a unique public_id)
     * @return a {@link UploadResult} containing the secure URL and public_id
     * @throws IOException if the upload fails
     */
    public UploadResult uploadChatMedia(MultipartFile file, Long chatRoomId) throws IOException {
        String uniqueName = "chat-" + chatRoomId + "-" + java.util.UUID.randomUUID().toString();
        return upload(file, folder("chat-media"), uniqueName);
    }

    /**
     * Uploads a group cover / avatar image.
     *
     * @param file    the multipart file received from the HTTP request
     * @param groupId the group's ID (used to build a unique public_id)
     * @return a {@link UploadResult} containing the secure URL and public_id
     * @throws IOException if the upload fails
     */
    public UploadResult uploadGroupImage(MultipartFile file, Long groupId) throws IOException {
        return upload(file, folder("group-images"), publicId("group-images", "group-" + groupId));
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    /**
     * Permanently deletes an asset from Cloudinary using its public_id.
     *
     * @param publicId the Cloudinary public_id of the asset to delete
     * @throws IOException if the deletion API call fails
     */
    public void delete(String publicId) throws IOException {
        log.info("Deleting Cloudinary asset: {}", publicId);
        Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        log.debug("Cloudinary delete response: {}", result);
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    /**
     * Core upload logic shared by all public upload methods.
     *
     * @param file     the file to upload
     * @param folder   the Cloudinary folder path (e.g. {@code peernexus/profile-pictures})
     * @param publicId the unique identifier for the asset on Cloudinary
     * @return an {@link UploadResult} with the secure URL and public_id
     * @throws IOException on upload failure
     */
    private UploadResult upload(MultipartFile file, String folder, String publicId) throws IOException {
        log.info("Uploading file '{}' to Cloudinary folder '{}'", file.getOriginalFilename(), folder);

        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder",    folder,
                        "public_id", publicId,
                        "overwrite", true     // replace if a file with the same ID exists
                )
        );

        String secureUrl  = (String) result.get("secure_url");
        String returnedId = (String) result.get("public_id");

        log.info("Upload complete. public_id={}, url={}", returnedId, secureUrl);
        return new UploadResult(secureUrl, returnedId);
    }

    /** Builds the full Cloudinary folder path under the root folder. */
    private String folder(String subFolder) {
        return ROOT_FOLDER + "/" + subFolder;
    }

    /**
     * Builds a deterministic public_id that includes the subfolder prefix so that
     * the full path on Cloudinary becomes {@code peernexus/<subFolder>/<name>}.
     */
    private String publicId(String subFolder, String name) {
        // Cloudinary prefixes the public_id with the folder automatically
        // when the upload options contain "folder". We still use a distinctive
        // name so that subsequent uploads for the same entity overwrite the old file.
        return name;
    }

    // -------------------------------------------------------------------------
    // Result record
    // -------------------------------------------------------------------------

    /**
     * Immutable value object returned after a successful Cloudinary upload.
     *
     * @param secureUrl the HTTPS URL of the uploaded asset; store this in MySQL
     * @param publicId  the Cloudinary public_id; store this if you need to delete later
     */
    public record UploadResult(String secureUrl, String publicId) {}
}
