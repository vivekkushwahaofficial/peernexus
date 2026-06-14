package com.peernexus.peernexus.answer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AnswerUpdateRequest(
        @NotBlank(message = "Content is required")
        @Size(min = 2, max = 5000, message = "Content must be between 2 and 5000 characters")
        String content
        ) {

}
