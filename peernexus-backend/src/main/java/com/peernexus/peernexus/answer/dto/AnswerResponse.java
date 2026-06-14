package com.peernexus.peernexus.answer.dto;

import java.time.Instant;

import com.peernexus.peernexus.doubt.dto.UserSummary;

import lombok.Builder;

@Builder
public record AnswerResponse(
        Long id,
        Long doubtId,
        String content,
        boolean accepted,
        int upvotes,
        int downvotes,
        UserSummary author,
        Instant createdAt,
        Instant updatedAt
        ) {

}
