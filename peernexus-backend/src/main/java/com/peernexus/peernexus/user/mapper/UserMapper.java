package com.peernexus.peernexus.user.mapper;

import org.mapstruct.Mapper;

import com.peernexus.peernexus.user.dto.UserResponse;
import com.peernexus.peernexus.user.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);
}
