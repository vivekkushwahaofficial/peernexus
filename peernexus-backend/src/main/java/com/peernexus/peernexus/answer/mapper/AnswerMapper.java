package com.peernexus.peernexus.answer.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.peernexus.peernexus.answer.dto.AnswerResponse;
import com.peernexus.peernexus.answer.entity.Answer;
import com.peernexus.peernexus.doubt.dto.UserSummary;
import com.peernexus.peernexus.user.entity.User;

@Mapper(componentModel = "spring")
public interface AnswerMapper {

    @Mapping(target = "doubtId", expression = "java(answer.getDoubt().getId())")
    @Mapping(target = "author", expression = "java(toUserSummary(answer.getAuthor()))")
    @Mapping(target = "upvotes", ignore = true)
    @Mapping(target = "downvotes", ignore = true)
    AnswerResponse toResponse(Answer answer);

    default UserSummary toUserSummary(User user) {
        if (user == null) {
            return null;
        }
        return UserSummary.builder()
                .id(user.getId())
                .name(user.getName())
                .role(user.getRole())
                .verified(user.isVerified())
                .build();
    }
}
