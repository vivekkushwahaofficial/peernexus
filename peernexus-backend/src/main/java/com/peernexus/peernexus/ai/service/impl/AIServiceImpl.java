package com.peernexus.peernexus.ai.service.impl;

import org.springframework.stereotype.Service;

import com.peernexus.peernexus.ai.client.GeminiClient;
import com.peernexus.peernexus.ai.dto.AIRequest;
import com.peernexus.peernexus.ai.dto.AIResponse;
import com.peernexus.peernexus.ai.service.AIService;

import lombok.RequiredArgsConstructor;

/**
 * Service implementation for handling AI operations.
 * Delegates direct API queries to GeminiClient.
 */
@Service
@RequiredArgsConstructor
public class AIServiceImpl implements AIService {

    private final GeminiClient geminiClient;

    @Override
    public AIResponse explain(AIRequest request) {
        return geminiClient.generateGuidance(request);
    }
}
