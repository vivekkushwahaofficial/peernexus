package com.peernexus.peernexus.doubt.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DoubtImageUploadRequest(
        @Size(max = 5, message = "Images must be at most 5 items")
        List<@NotBlank @Size(max = 500, message = "Image URL must be at most 500 characters") String> imageUrls
        ) {

}
