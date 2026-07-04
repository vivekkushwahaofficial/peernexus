package com.peernexus.peernexus.cloudinary.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;

/**
 * Low-level local file system implementation of the {@link StorageService} interface.
 *
 * <p>Stores uploaded files under the "uploads" directory inside the project's working directory.
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "storage.provider", havingValue = "local")
public class LocalStorageService implements StorageService {

    @Value("${app.backend.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final String UPLOADS_DIR = "uploads";

    @Override
    public UploadResult upload(MultipartFile file, String folder, String publicId) throws IOException {
        log.info("Uploading file '{}' to local storage folder '{}'", file.getOriginalFilename(), folder);

        Path uploadPath = Paths.get(UPLOADS_DIR, folder);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String extension = "";
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && originalFilename.lastIndexOf(".") != -1) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String filename = (publicId != null ? publicId.replace("/", "_") : UUID.randomUUID().toString()) + extension;
        Path filePath = uploadPath.resolve(filename);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String relativePath = "/" + UPLOADS_DIR + "/" + folder + "/" + filename;
        String secureUrl = baseUrl + relativePath;
        String returnedId = folder + "/" + filename;

        log.info("Local upload complete. public_id={}, url={}", returnedId, secureUrl);
        return new UploadResult(secureUrl, returnedId);
    }

    @Override
    public void delete(String publicId) throws IOException {
        log.info("Deleting file from local storage: {}", publicId);
        Path filePath = Paths.get(UPLOADS_DIR, publicId);
        Files.deleteIfExists(filePath);
    }
}
