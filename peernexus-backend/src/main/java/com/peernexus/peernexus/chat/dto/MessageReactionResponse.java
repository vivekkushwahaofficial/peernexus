package com.peernexus.peernexus.chat.dto;

import lombok.Builder;

@Builder
public record MessageReactionResponse(
        Long id,
        Long userId,
        String reaction
) {}
