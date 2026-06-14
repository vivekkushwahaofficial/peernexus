package com.peernexus.peernexus.chat.dto;

public record MessageReactionRequest(
        Long messageId,
        String reaction
) {}
