package com.peernexus.peernexus.ai.client;

import java.util.List;
import java.util.Map;

import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.peernexus.peernexus.ai.config.GeminiConfig;
import com.peernexus.peernexus.ai.dto.AIRequest;
import com.peernexus.peernexus.ai.dto.AIResponse;
import com.peernexus.peernexus.exception.BadRequestException;
import com.peernexus.peernexus.exception.GatewayTimeoutException;
import com.peernexus.peernexus.exception.RateLimitExceededException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Client class for directly communicating with the Google Gemini API.
 * Encapsulates the REST call, prompt formatting, JSON schema validation,
 * secure non-sensitive logging, and structured error translations.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GeminiClient {

    private final GeminiConfig geminiConfig;
    private final RestClient geminiRestClient;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = 
            "You are PeerNexus AI Learning Assistant.\n" +
            "Your role is to help students learn.\n" +
            "Always:\n" +
            "- Provide concise, guiding hints first.\n" +
            "- Explain concepts clearly and briefly (keep the explanation under 3-4 sentences if possible).\n" +
            "- Encourage critical thinking and debugging.\n" +
            "- Suggest related topics.\n" +
            "- Never encourage cheating or complete graded assignments/homework directly.\n" +
            "- Never claim certainty if unsure.\n" +
            "- End the explanation by encouraging the student to review peer answers below.";


    public AIResponse generateGuidance(AIRequest request) {
        String apiKey = geminiConfig.getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.error("Unable to request AI guidance: Gemini API Key is missing or empty.");
            throw new BadRequestException("Unable to generate AI response. Gemini API Key is not configured.");
        }

        String username = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "anonymous";

        log.info("User '{}' requested AI guidance", username);
        long startTime = System.currentTimeMillis();

        // Build the prompt containing title and description
        String prompt = String.format(
                "%s\n\n" +
                "Doubt Title: %s\n" +
                "Doubt Description: %s\n\n" +
                "Output must be a JSON object containing the fields: 'hint' (string), 'explanation' (string), " +
                "'checks' (array of strings, exactly 3 items), and 'relatedTopics' (array of strings, 3-4 items).",
                SYSTEM_PROMPT,
                request.getTitle(),
                request.getDescription()
        );

        // Build request body for Gemini API with json response schema
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", prompt))
            )),
            "generationConfig", Map.of(
                "responseMimeType", "application/json",
                "responseSchema", Map.of(
                    "type", "OBJECT",
                    "properties", Map.of(
                        "hint", Map.of("type", "STRING"),
                        "explanation", Map.of("type", "STRING"),
                        "checks", Map.of(
                            "type", "ARRAY",
                            "items", Map.of("type", "STRING")
                        ),
                        "relatedTopics", Map.of(
                            "type", "ARRAY",
                            "items", Map.of("type", "STRING")
                        )
                    ),
                    "required", List.of("hint", "explanation", "checks", "relatedTopics")
                )
            )
        );

        try {
            String path = String.format("/v1beta/models/%s:generateContent", geminiConfig.getModel());

            String responseJson = geminiRestClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path(path)
                            .queryParam("key", apiKey)
                            .build())
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            if (responseJson == null || responseJson.trim().isEmpty()) {
                throw new BadRequestException("Unable to generate AI response. Empty response from Gemini API.");
            }

            JsonNode rootNode = objectMapper.readTree(responseJson);
            JsonNode textNode = rootNode.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (textNode.isMissingNode() || textNode.asText().isEmpty()) {
                log.error("Invalid response structure from Gemini API");
                throw new BadRequestException("Unable to generate AI response. Invalid structure returned by Gemini.");
            }

            String innerJson = textNode.asText().trim();
            // Handle optional markdown code fences in LLM output
            if (innerJson.startsWith("```json")) {
                innerJson = innerJson.substring(7);
            } else if (innerJson.startsWith("```")) {
                innerJson = innerJson.substring(3);
            }
            if (innerJson.endsWith("```")) {
                innerJson = innerJson.substring(0, innerJson.length() - 3);
            }
            innerJson = innerJson.trim();

            AIResponse aiResponse = objectMapper.readValue(innerJson, AIResponse.class);

            // Safe parsing validation
            if (aiResponse.getHint() == null || aiResponse.getExplanation() == null 
                    || aiResponse.getChecks() == null || aiResponse.getRelatedTopics() == null) {
                log.error("AIResponse fields are incomplete or invalid: {}", innerJson);
                throw new BadRequestException("Unable to generate AI response. Incomplete response structure.");
            }

            long duration = System.currentTimeMillis() - startTime;
            log.info("AI guidance request completed in {} ms, Status: SUCCESS", duration);

            return aiResponse;

        } catch (HttpClientErrorException e) {
            long duration = System.currentTimeMillis() - startTime;
            int statusCode = e.getStatusCode().value();
            log.warn("AI guidance request failed in {} ms, Status: CLIENT_ERROR ({})", duration, statusCode);
            
            if (statusCode == 401 || statusCode == 403) {
                throw new BadRequestException("Unable to generate AI response. Invalid Gemini API Key.");
            } else if (statusCode == 429) {
                throw new RateLimitExceededException("Unable to generate AI response. Rate limit exceeded (429).");
            } else {
                throw new BadRequestException("Unable to generate AI response. Upstream client error.");
            }
        } catch (HttpServerErrorException e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("AI guidance request failed in {} ms, Status: SERVER_ERROR ({})", duration, e.getStatusCode());
            throw new BadRequestException("Unable to generate AI response. Gemini server error (500).");
        } catch (ResourceAccessException e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("AI guidance request timed out or failed to connect after {} ms: {}", duration, e.getMessage());
            throw new GatewayTimeoutException("The AI service is taking longer than expected. Please try again in a few moments.");
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("AI guidance request failed after {} ms with unexpected error: ", duration, e);
            throw new BadRequestException("Unable to generate AI response: " + e.getMessage());
        }
    }
}
