package com.peernexus.peernexus.doubt.dto;

import lombok.Builder;

@Builder
public record CategoryResponse(Long id, String name, String description) {

}
