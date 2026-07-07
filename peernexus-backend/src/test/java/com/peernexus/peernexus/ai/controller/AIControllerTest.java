package com.peernexus.peernexus.ai.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.peernexus.peernexus.ai.dto.AIRequest;
import com.peernexus.peernexus.ai.dto.AIResponse;
import com.peernexus.peernexus.ai.service.AIService;
import com.peernexus.peernexus.config.security.JwtService;
import com.peernexus.peernexus.config.security.UserDetailsServiceImpl;

import java.util.List;

@WebMvcTest(controllers = AIController.class)
class AIControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AIService aiService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void explain_unauthorized_returns401() throws Exception {
        AIRequest request = new AIRequest("Title", "Description");
        mockMvc.perform(post("/api/ai/explain")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "student")
    void explain_authorized_returns200() throws Exception {
        AIRequest request = new AIRequest("Title", "Description");
        AIResponse response = AIResponse.builder()
                .hint("Use a checks list")
                .explanation("Explanatory text")
                .checks(List.of("check1"))
                .relatedTopics(List.of("topic1"))
                .build();

        when(aiService.explain(any(AIRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/ai/explain")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.hint").value("Use a checks list"))
                .andExpect(jsonPath("$.data.explanation").value("Explanatory text"));
    }

    @Test
    @WithMockUser(username = "student")
    void explain_invalidBody_returns400() throws Exception {
        AIRequest request = new AIRequest("", ""); // Blank validation failure
        mockMvc.perform(post("/api/ai/explain")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
