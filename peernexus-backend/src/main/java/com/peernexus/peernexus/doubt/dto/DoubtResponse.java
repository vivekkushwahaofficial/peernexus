package com.peernexus.peernexus.doubt.dto;

import java.time.Instant;
import java.util.List;

import com.peernexus.peernexus.doubt.entity.DoubtStatus;

import lombok.Builder;

@Builder
public record DoubtResponse(
        Long id,
        String title,
        String content,
        DoubtStatus status,
        CategoryResponse category,
        UserSummary author,
        List<String> tags,
        List<DoubtImageResponse> images,
        Instant createdAt,
        Instant updatedAt
        ) {

}
