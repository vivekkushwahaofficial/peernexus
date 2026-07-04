package com.peernexus.peernexus.cloudinary.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Low-level Cloudinary implementation of the {@link StorageService} interface.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "storage.provider", havingValue = "cloudinary", matchIfMissing = true)
public class CloudinaryStorageService implements StorageService {

    private final Cloudinary cloudinary;

    @Override
    public UploadResult upload(MultipartFile file, String folder, String publicId) throws IOException {
        log.info("Uploading file '{}' to Cloudinary folder '{}'", file.getOriginalFilename(), folder);

        Map<String, Object> options = ObjectUtils.asMap(
                "folder",    folder,
                "public_id", publicId,
                "overwrite", true
        );

        // Apply optimization transformation for profile picture uploads
        if (folder != null && folder.contains("/profile")) {
            log.info("Applying 400x400 face-cropping optimization for profile avatar.");
            options.put("transformation", "w_400,h_400,c_fill,g_face,f_auto,q_auto");
        }

        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);

        String secureUrl  = (String) result.get("secure_url");
        String returnedId = (String) result.get("public_id");

        log.info("Cloudinary upload complete. public_id={}, url={}", returnedId, secureUrl);
        return new UploadResult(secureUrl, returnedId);
    }

    @Override
    public void delete(String publicId) throws IOException {
        log.info("Deleting asset from Cloudinary: {}", publicId);
        Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        log.debug("Cloudinary delete response: {}", result);
    }
}
