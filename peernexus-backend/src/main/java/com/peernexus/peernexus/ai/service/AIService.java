package com.peernexus.peernexus.ai.service;

import com.peernexus.peernexus.ai.dto.AIRequest;
import com.peernexus.peernexus.ai.dto.AIResponse;

/**
 * Service interface for handling AI operations.
 */
public interface AIService {

    /**
     * Generates educational guidance based on a doubt request.
     *
     * @param request the input doubt request
     * @return the structured AI response containing hints, explanation, checks, and topics
     */
    AIResponse explain(AIRequest request);
}
