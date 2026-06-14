package com.peernexus.peernexus.user.dto;

import jakarta.validation.constraints.Size;

import lombok.Builder;

@Builder
public record UserUpdateRequest(
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,
        @Size(max = 500, message = "Bio must be at most 500 characters")
        String bio,
        @Size(max = 500, message = "Skills must be at most 500 characters")
        String skills,
        @Size(max = 500, message = "Interests must be at most 500 characters")
        String interests
        ) {

}
