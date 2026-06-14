package com.peernexus.peernexus.config.security;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Servlet filter that validates the JWT on every request.
 *
 * <h2>Flow</h2>
 * <ol>
 *   <li>Read the {@code Authorization: Bearer &lt;token&gt;} header.</li>
 *   <li>Extract and validate the username from the token.</li>
 *   <li>If valid, set the Spring Security authentication principal.</li>
 *   <li>If invalid, write a structured {@code 401} response and stop the chain.</li>
 * </ol>
 *
 * <h2>Error handling</h2>
 * All JWT-related exceptions ({@link ExpiredJwtException},
 * {@link MalformedJwtException}, {@link SignatureException}, etc.) are caught
 * here and produce a {@code 401 Unauthorized} JSON body so they are never
 * propagated as unhandled 500s.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            String username = jwtService.extractUsername(token);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtService.isTokenValid(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }

        } catch (ExpiredJwtException ex) {
            log.debug("JWT expired for request [{}]: {}", request.getRequestURI(), ex.getMessage());
            writeUnauthorized(response, "Token has expired");
            return;

        } catch (MalformedJwtException ex) {
            log.warn("Malformed JWT for request [{}]: {}", request.getRequestURI(), ex.getMessage());
            writeUnauthorized(response, "Malformed token");
            return;

        } catch (SignatureException ex) {
            log.warn("JWT signature invalid for request [{}]: {}", request.getRequestURI(), ex.getMessage());
            writeUnauthorized(response, "Invalid token signature");
            return;

        } catch (JwtException ex) {
            // Catch-all for any other JJWT exception (UnsupportedJwtException, etc.)
            log.warn("JWT validation failed for request [{}]: {}", request.getRequestURI(), ex.getMessage());
            writeUnauthorized(response, "Invalid token");
            return;

        } catch (UsernameNotFoundException ex) {
            log.warn("JWT references unknown user for request [{}]: {}", request.getRequestURI(), ex.getMessage());
            writeUnauthorized(response, "User not found");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Writes a structured {@code 401 Unauthorized} JSON response and stops
     * further filter chain processing.
     *
     * @param response the servlet response
     * @param message  human-readable error detail (safe to expose to the client)
     */
    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(
                "{\"success\":false,\"message\":\"" + message + "\",\"data\":null}"
        );
    }
}
