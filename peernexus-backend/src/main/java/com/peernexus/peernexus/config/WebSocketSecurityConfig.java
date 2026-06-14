package com.peernexus.peernexus.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.peernexus.peernexus.config.security.JwtService;
import com.peernexus.peernexus.config.security.UserDetailsServiceImpl;
import com.peernexus.peernexus.group.repository.GroupMemberRepository;
import com.peernexus.peernexus.user.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Integrates JWT authentication into the STOMP handshake / CONNECT lifecycle.
 *
 * <p>The client passes its JWT via the STOMP {@code Authorization} header
 * (value: {@code Bearer <token>}) or via the {@code token} STOMP header
 * during the {@code CONNECT} frame.  Either approach works because this
 * interceptor checks both.
 *
 * <p>On a valid token the interceptor sets a fully-authenticated
 * {@link UsernamePasswordAuthenticationToken} as the STOMP session's
 * {@code nativeHeaders} principal, which Spring then propagates to every
 * subsequent message in the session.
 *
 * <p>On {@code SUBSCRIBE} frames targeting {@code /topic/group.*} destinations,
 * membership is validated against the database before the subscription is
 * allowed.  Unauthorized subscriptions are rejected with a STOMP ERROR frame
 * and the violation is logged at WARN level.
 *
 * <p>The {@code @Order(Ordered.HIGHEST_PRECEDENCE + 99)} annotation ensures
 * this interceptor runs before Spring Security's own channel interceptors.
 */
@Slf4j
@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@RequiredArgsConstructor
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;
    private final GroupMemberRepository groupMemberRepository;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor == null) {
                    return message;
                }

                // Propagate session authentication to thread-local SecurityContextHolder
                if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }

                // ── CONNECT: authenticate via JWT ──────────────────────────
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String token = extractToken(accessor);
                    if (token == null) {
                        log.warn("WebSocket CONNECT rejected – token missing");
                        throw new IllegalArgumentException("Authentication token is required");
                    }
                    try {
                        String username = jwtService.extractUsername(token);
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        if (jwtService.isTokenValid(token, userDetails)) {
                            UsernamePasswordAuthenticationToken auth =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities()
                                    );
                            SecurityContextHolder.getContext().setAuthentication(auth);
                            accessor.setUser(auth);
                            log.debug("WebSocket CONNECT authenticated: {}", username);
                        } else {
                            log.warn("WebSocket CONNECT rejected – invalid token for user {}", username);
                            throw new IllegalArgumentException("Invalid authentication token");
                        }
                    } catch (Exception ex) {
                        log.warn("WebSocket CONNECT – invalid JWT: {}", ex.getMessage());
                        throw new IllegalArgumentException("Authentication failed: " + ex.getMessage());
                    }
                }

                // ── SUBSCRIBE: enforce group membership ────────────────────
                if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    String destination = accessor.getDestination();
                    if (destination != null) {
                        Long userId = resolveUserId(accessor);
                        if (userId == null) {
                            log.warn("WebSocket SUBSCRIBE rejected – unauthenticated attempt to subscribe to {}", destination);
                            throw new IllegalArgumentException("Authentication required to subscribe");
                        }

                        if (destination.startsWith("/topic/group.")) {
                            // Extract groupId from destination: /topic/group.<groupId>[.suffix]
                            String[] parts = destination.substring("/topic/group.".length()).split("\\.", 2);
                            if (parts.length >= 1) {
                                try {
                                    Long groupId = Long.parseLong(parts[0]);
                                    boolean isMember = groupMemberRepository.existsByGroupIdAndUserId(groupId, userId);
                                    if (!isMember) {
                                        log.warn("WebSocket SUBSCRIBE DENIED – user {} attempted to subscribe to {} without membership",
                                                userId, destination);
                                        throw new IllegalArgumentException("Access denied: Not a member of this group");
                                    }
                                    log.debug("WebSocket SUBSCRIBE allowed – user {} subscribed to {}", userId, destination);
                                } catch (NumberFormatException ex) {
                                    log.warn("WebSocket SUBSCRIBE – could not parse groupId from destination: {}", destination);
                                    throw new IllegalArgumentException("Invalid subscription destination");
                                }
                            }
                        }
                    }
                }

                return message;
            }
        });
    }

    /**
     * Extracts the raw JWT from the STOMP {@code Authorization} header
     * ({@code Bearer <token>}) or from the {@code token} native header.
     */
    private String extractToken(StompHeaderAccessor accessor) {
        // Try standard Authorization header first
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        // Fallback: bare token in a custom "token" header (common in SockJS clients)
        return accessor.getFirstNativeHeader("token");
    }

    /**
     * Resolves the user ID from the session principal (set during CONNECT).
     *
     * @param accessor the STOMP header accessor for the current frame
     * @return the user ID, or {@code null} if the session is not authenticated
     */
    private Long resolveUserId(StompHeaderAccessor accessor) {
        java.security.Principal principal = accessor.getUser();
        if (principal instanceof UsernamePasswordAuthenticationToken authToken) {
            Object details = authToken.getPrincipal();
            if (details instanceof UserDetailsImpl userDetails) {
                return userDetails.getId();
            }
        }
        return null;
    }
}
