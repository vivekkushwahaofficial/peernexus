package com.peernexus.peernexus.chat.dto;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record UserChatResponse(
        Long id,
        String name,
        String profilePicture,
        boolean online,
        LocalDateTime lastSeen
) {}
