package com.peernexus.peernexus.groupchat.dto;

import com.peernexus.peernexus.chat.entity.MessageType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Payload sent by the client over STOMP to {@code /app/group.send}.
 *
 * <p>For TEXT messages, {@code content} is the message body.
 * For IMAGE / FILE messages, {@code content} is the Cloudinary URL obtained
 * from the upload API before sending this STOMP frame.
 *
 * @param groupId  target study group
 * @param content  text body or Cloudinary URL
 * @param type     TEXT | IMAGE | FILE
 * @param fileName original filename (FILE messages only, may be null)
 */
public record GroupSendMessageRequest(
        @NotNull Long groupId,
        @NotBlank String content,
        @NotNull MessageType type,
        String fileName
) {}
