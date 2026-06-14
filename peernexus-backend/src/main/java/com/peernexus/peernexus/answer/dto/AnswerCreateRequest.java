package com.peernexus.peernexus.answer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AnswerCreateRequest(
        @NotNull(message = "Doubt is required")
        Long doubtId,
        @NotBlank(message = "Content is required")
        @Size(min = 2, max = 5000, message = "Content must be between 2 and 5000 characters")
        String content
        ) {

}
