package com.peernexus.peernexus.user.service;

import com.peernexus.peernexus.user.dto.UserResponse;
import com.peernexus.peernexus.user.dto.UserUpdateRequest;

public interface UserService {

    UserResponse getCurrentUser();

    UserResponse getById(Long id);

    UserResponse updateCurrentUser(UserUpdateRequest request);

    UserResponse updateProfilePicture(org.springframework.web.multipart.MultipartFile file);
}
