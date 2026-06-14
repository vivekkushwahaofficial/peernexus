package com.peernexus.peernexus.connection.dto;

import jakarta.validation.constraints.NotNull;

public record ConnectionRequest(
        @NotNull(message = "Recipient is required")
        Long recipientId
        ) {

}
