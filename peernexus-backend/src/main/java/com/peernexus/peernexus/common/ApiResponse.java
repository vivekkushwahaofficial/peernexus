package com.peernexus.peernexus.common;

import lombok.Builder;

@Builder
public record ApiResponse<T>(boolean success, String message, T data) {

}
