package com.peernexus.peernexus.user.service.impl;

import java.util.Objects;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.peernexus.peernexus.exception.ResourceNotFoundException;
import com.peernexus.peernexus.user.dto.UserResponse;
import com.peernexus.peernexus.user.dto.UserUpdateRequest;
import com.peernexus.peernexus.user.entity.User;
import com.peernexus.peernexus.user.mapper.UserMapper;
import com.peernexus.peernexus.user.repository.UserRepository;
import com.peernexus.peernexus.user.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final com.peernexus.peernexus.cloudinary.service.CloudinaryService cloudinaryService;

    @Override
    public UserResponse getCurrentUser() {
        User user = resolveCurrentUser();
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse updateCurrentUser(UserUpdateRequest request) {
        User user = resolveCurrentUser();
        if (Objects.nonNull(request.name())) {
            user.setName(request.name());
        }
        if (Objects.nonNull(request.bio())) {
            user.setBio(request.bio());
        }
        if (Objects.nonNull(request.skills())) {
            user.setSkills(request.skills());
        }
        if (Objects.nonNull(request.interests())) {
            user.setInterests(request.interests());
        }
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public UserResponse updateProfilePicture(org.springframework.web.multipart.MultipartFile file) {
        User user = resolveCurrentUser();
        try {
            com.peernexus.peernexus.cloudinary.service.CloudinaryService.UploadResult result =
                    cloudinaryService.uploadProfilePicture(file, user.getId());
            user.setProfilePicture(result.secureUrl());
            return userMapper.toResponse(userRepository.save(user));
        } catch (java.io.IOException e) {
            throw new com.peernexus.peernexus.exception.BadRequestException("Failed to upload profile picture: " + e.getMessage());
        }
    }

    private User resolveCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof com.peernexus.peernexus.user.security.UserDetailsImpl details) {
            return userRepository.findById(details.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        throw new ResourceNotFoundException("User not found");
    }
}
