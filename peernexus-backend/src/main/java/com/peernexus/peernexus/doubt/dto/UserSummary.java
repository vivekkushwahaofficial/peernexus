package com.peernexus.peernexus.doubt.dto;

import com.peernexus.peernexus.user.entity.Role;

import lombok.Builder;

@Builder
public record UserSummary(Long id, String name, Role role, boolean verified) {

}
