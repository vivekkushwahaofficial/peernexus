package com.peernexus.peernexus.answer.dto;

import jakarta.validation.constraints.NotNull;

import com.peernexus.peernexus.answer.entity.VoteType;

public record VoteRequest(
        @NotNull(message = "Vote type is required")
        VoteType type
        ) {

}
