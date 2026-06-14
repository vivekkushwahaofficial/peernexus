package com.peernexus.peernexus.connection.mapper;

import org.mapstruct.Mapper;

import com.peernexus.peernexus.connection.dto.ConnectionResponse;
import com.peernexus.peernexus.connection.dto.ConnectionUserSummary;
import com.peernexus.peernexus.connection.entity.Connection;
import com.peernexus.peernexus.user.entity.User;

@Mapper(componentModel = "spring")
public interface ConnectionMapper {

    default ConnectionResponse toResponse(Connection connection) {
        if (connection == null) {
            return null;
        }
        return ConnectionResponse.builder()
                .id(connection.getId())
                .requester(toUserSummary(connection.getRequester()))
                .recipient(toUserSummary(connection.getRecipient()))
                .status(connection.getStatus())
                .createdAt(connection.getCreatedAt())
                .build();
    }

    default ConnectionUserSummary toUserSummary(User user) {
        if (user == null) {
            return null;
        }
        return ConnectionUserSummary.builder()
                .id(user.getId())
                .name(user.getName())
                .role(user.getRole())
                .verified(user.isVerified())
                .reputationPoints(user.getReputationPoints())
                .reputationLevel(user.getReputationLevel())
                .build();
    }
}
