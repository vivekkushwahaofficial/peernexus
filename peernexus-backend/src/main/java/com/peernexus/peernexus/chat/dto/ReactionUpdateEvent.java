package com.peernexus.peernexus.chat.dto;

import java.util.List;

public record ReactionUpdateEvent(
        Long chatRoomId,
        Long messageId,
        List<MessageReactionResponse> reactions
) {}
