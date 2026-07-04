package com.peernexus.peernexus.cloudinary.service;

import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;

/**
 * Common abstraction for storing and deleting files.
 *
 * <p>Can be implemented by various providers (e.g. Cloudinary, Local File System, AWS S3).
 */
public interface StorageService {

    /**
     * Uploads a file to the storage provider.
     *
     * @param file     the file to upload
     * @param folder   the folder directory (e.g., peernexus/profile)
     * @param publicId the requested identifier/prefix for the file
     * @return the secure HTTPS URL and the unique public_id
     * @throws IOException if upload fails
     */
    UploadResult upload(MultipartFile file, String folder, String publicId) throws IOException;

    /**
     * Deletes a file from the storage provider using its public ID.
     *
     * @param publicId the unique identifier of the file to delete
     * @throws IOException if deletion fails
     */
    void delete(String publicId) throws IOException;

    /**
     * Immutable response representation of an upload operation.
     */
    record UploadResult(String secureUrl, String publicId) {}
}
