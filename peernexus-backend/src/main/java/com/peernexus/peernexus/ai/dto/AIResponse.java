package com.peernexus.peernexus.ai.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response body DTO for AI explanation response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIResponse {
    private String hint;
    private String explanation;
    private List<String> checks;
    private List<String> relatedTopics;
}
