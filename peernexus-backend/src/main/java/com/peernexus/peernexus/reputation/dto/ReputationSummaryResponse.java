package com.peernexus.peernexus.reputation.dto;

import com.peernexus.peernexus.reputation.entity.ReputationLevel;

import lombok.Builder;

@Builder
public record ReputationSummaryResponse(int points, ReputationLevel level) {

}
