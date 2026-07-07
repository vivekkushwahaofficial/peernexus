package com.peernexus.peernexus.ai.client;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.util.List;
import java.util.function.Function;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.peernexus.peernexus.ai.config.GeminiConfig;
import com.peernexus.peernexus.ai.dto.AIRequest;
import com.peernexus.peernexus.ai.dto.AIResponse;
import com.peernexus.peernexus.exception.BadRequestException;
import com.peernexus.peernexus.exception.GatewayTimeoutException;
import com.peernexus.peernexus.exception.RateLimitExceededException;

class GeminiClientTest {

    private GeminiConfig geminiConfig;
    private RestClient restClient;
    private ObjectMapper objectMapper;
    private GeminiClient geminiClient;

    private RestClient.RequestBodyUriSpec requestBodyUriSpec;
    private RestClient.RequestBodySpec requestBodySpec;
    private RestClient.ResponseSpec responseSpec;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        geminiConfig = mock(GeminiConfig.class);
        restClient = mock(RestClient.class);
        objectMapper = new ObjectMapper();
        geminiClient = new GeminiClient(geminiConfig, restClient, objectMapper);

        requestBodyUriSpec = mock(RestClient.RequestBodyUriSpec.class);
        requestBodySpec = mock(RestClient.RequestBodySpec.class);
        responseSpec = mock(RestClient.ResponseSpec.class);

        when(geminiConfig.getApiKey()).thenReturn("TEST_KEY");
        when(geminiConfig.getModel()).thenReturn("gemini-2.5-flash");

        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(any(Function.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(Object.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
    }

    @Test
    void generateGuidance_success_parsesJsonCorrectly() {
        String mockGeminiResponse = "{\n" +
                "  \"candidates\": [{\n" +
                "    \"content\": {\n" +
                "      \"parts\": [{\n" +
                "        \"text\": \"{\\n  \\\"hint\\\": \\\"This is a hint\\\",\\n  \\\"explanation\\\": \\\"This is an explanation\\\",\\n  \\\"checks\\\": [\\\"check1\\\", \\\"check2\\\"],\\n  \\\"relatedTopics\\\": [\\\"topic1\\\", \\\"topic2\\\"]\\n}\"\n" +
                "      }]\n" +
                "    }\n" +
                "  }]\n" +
                "}";

        when(responseSpec.body(String.class)).thenReturn(mockGeminiResponse);

        AIRequest request = new AIRequest("NullPointerException", "I get NPE here");
        AIResponse response = geminiClient.generateGuidance(request);

        assertNotNull(response);
        assertEquals("This is a hint", response.getHint());
        assertEquals("This is an explanation", response.getExplanation());
        assertEquals(List.of("check1", "check2"), response.getChecks());
        assertEquals(List.of("topic1", "topic2"), response.getRelatedTopics());
    }

    @Test
    void generateGuidance_apiKeyMissing_throwsBadRequest() {
        when(geminiConfig.getApiKey()).thenReturn(null);

        AIRequest request = new AIRequest("NullPointerException", "I get NPE here");
        assertThrows(BadRequestException.class, () -> geminiClient.generateGuidance(request));
    }

    @Test
    void generateGuidance_rateLimit429_throwsRateLimitExceeded() {
        when(responseSpec.body(String.class)).thenThrow(new HttpClientErrorException(HttpStatusCode.valueOf(429), "Too Many Requests"));

        AIRequest request = new AIRequest("NullPointerException", "I get NPE here");
        assertThrows(RateLimitExceededException.class, () -> geminiClient.generateGuidance(request));
    }

    @Test
    void generateGuidance_timeout_throwsGatewayTimeout() {
        when(responseSpec.body(String.class)).thenThrow(new ResourceAccessException("Read timed out"));

        AIRequest request = new AIRequest("NullPointerException", "I get NPE here");
        assertThrows(GatewayTimeoutException.class, () -> geminiClient.generateGuidance(request));
    }

    @Test
    void generateGuidance_serverError500_throwsBadRequest() {
        when(responseSpec.body(String.class)).thenThrow(new HttpServerErrorException(HttpStatusCode.valueOf(500), "Internal Server Error"));

        AIRequest request = new AIRequest("NullPointerException", "I get NPE here");
        assertThrows(BadRequestException.class, () -> geminiClient.generateGuidance(request));
    }
}
