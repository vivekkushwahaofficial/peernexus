package com.peernexus.peernexus.doubt.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DoubtCreateRequest(
        @NotBlank(message = "Title is required")
        @Size(min = 5, max = 150, message = "Title must be between 5 and 150 characters")
        String title,
        @NotBlank(message = "Content is required")
        @Size(min = 10, max = 5000, message = "Content must be between 10 and 5000 characters")
        String content,
        @NotNull(message = "Category is required")
        Long categoryId,
        @Size(max = 10, message = "Tags must be at most 10 items")
        List<@NotBlank @Size(max = 30, message = "Tag must be at most 30 characters") String> tagNames,
        @Size(max = 5, message = "Images must be at most 5 items")
        List<@NotBlank @Size(max = 500, message = "Image URL must be at most 500 characters") String> imageUrls
        ) {

}
