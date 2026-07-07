package com.peernexus.peernexus.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.peernexus.peernexus.common.ApiResponse;
import com.peernexus.peernexus.ai.dto.AIRequest;
import com.peernexus.peernexus.ai.dto.AIResponse;
import com.peernexus.peernexus.ai.service.AIService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Controller exposing endpoints for AI integration.
 * Routes incoming doubts to the AIService for generating guidance.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Validated
public class AIController {

    private final AIService aiService;

    @PostMapping("/explain")
    public ResponseEntity<ApiResponse<AIResponse>> explain(@Valid @RequestBody AIRequest request) {
        AIResponse response = aiService.explain(request);
        return ResponseEntity.ok(ApiResponse.<AIResponse>builder()
                .success(true)
                .message("AI explanation generated successfully")
                .data(response)
                .build());
    }
}
