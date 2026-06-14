package com.peernexus.peernexus.chat.dto;

public record EditMessageRequest(
        Long messageId,
        String content
) {}
