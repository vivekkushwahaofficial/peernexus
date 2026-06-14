package com.peernexus.peernexus.chat.dto;

import com.peernexus.peernexus.chat.entity.MessageType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Payload sent by the client over STOMP to {@code /app/chat.send}.
 *
 * <p>For TEXT messages, {@code content} is the message body.
 * For IMAGE / FILE messages, {@code content} is the Cloudinary URL obtained
 * from the upload API before sending this STOMP frame.
 *
 * @param chatRoomId target chat room
 * @param content    text body or Cloudinary URL
 * @param type       TEXT | IMAGE | FILE
 * @param fileName   original filename (FILE messages only, may be null)
 */
public record SendMessageRequest(
        @NotNull Long chatRoomId,
        @NotBlank String content,
        @NotNull MessageType type,
        String fileName,
        String fileUrl,
        Long fileSize,
        String mimeType
) {}
