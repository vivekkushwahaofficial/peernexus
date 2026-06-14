package com.peernexus.peernexus.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

/**
 * Configures Spring's STOMP-over-WebSocket message broker.
 *
 * <h2>Endpoint</h2>
 * Clients connect to {@code /ws} (with SockJS fallback for environments that
 * do not support native WebSocket).
 *
 * <h2>Broker destinations</h2>
 * <pre>
 * /topic/**       – public fanout (e.g. group chat, online-status per user)
 * /user/queue/**  – per-user private queues (messages, typing, receipts)
 * /app/**         – client-to-server STOMP frames (handled by @MessageMapping)
 * </pre>
 *
 * <h2>Security</h2>
 * Allowed WebSocket origins are controlled by the same
 * {@code app.cors.allowed-origins} property as REST CORS.
 * Wildcard {@code "*"} is intentionally NOT used.
 *
 * <h2>Transport limits</h2>
 * <ul>
 *   <li>Max message size: 64 KB per STOMP frame</li>
 *   <li>Send buffer:      512 KB (per session)</li>
 *   <li>Send timeout:     20 s (slow-consumer protection)</li>
 * </ul>
 *
 * <h2>Authentication</h2>
 * The JWT is passed as the {@code token} query parameter on the HTTP upgrade
 * request.  {@link WebSocketSecurityConfig} extracts it and sets the
 * Spring Security principal before the STOMP session is established.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Comma-separated list of allowed origins — same value as the REST CORS config.
     * Defaults to {@code http://localhost:5173} for local development.
     */
    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOriginsRaw;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins = Arrays.stream(allowedOriginsRaw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);

        registry.addEndpoint("/ws")
                .setAllowedOrigins(origins)   // explicit origins — no wildcard
                .withSockJS();                // SockJS fallback for browsers
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Destinations that the in-memory broker will handle
        registry.enableSimpleBroker("/topic", "/queue");

        // Prefix for client → server application messages (handled by @MessageMapping)
        registry.setApplicationDestinationPrefixes("/app");

        // Prefix that SimpleMessagingTemplate.convertAndSendToUser() will use
        registry.setUserDestinationPrefix("/user");
    }

    /**
     * Configures transport-level limits to protect against malicious clients.
     *
     * <ul>
     *   <li>{@code messageSizeLimit} – rejects any single STOMP frame larger
     *       than 64 KB, preventing payload-stuffing attacks.</li>
     *   <li>{@code sendBufferSizeLimit} – caps the per-session outbound buffer
     *       at 512 KB; slow consumers are disconnected before exhausting heap.</li>
     *   <li>{@code sendTimeLimit} – drops sessions that are not draining their
     *       buffer within 20 seconds (slow-consumer protection).</li>
     * </ul>
     */
    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        registry
                .setMessageSizeLimit(64 * 1024)         // 64 KB max per STOMP frame
                .setSendBufferSizeLimit(512 * 1024)      // 512 KB send buffer per session
                .setSendTimeLimit(20 * 1000);            // 20 s send timeout
    }
}
