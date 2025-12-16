package com.fintrack.gateway.filter;

import com.fintrack.gateway.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.Collections;

/**
 * WebFilter that extracts JWT from Authorization header and sets
 * SecurityContext
 */
public class JwtAuthenticationWebFilter implements WebFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationWebFilter.class);

    private final JwtUtil jwtUtil;

    public JwtAuthenticationWebFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().toString();

        // Skip JWT validation for public endpoints
        if (isPublicPath(path)) {
            logger.debug("🔓 Public path, skipping JWT validation: {}", path);
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            logger.info("🔑 JWT token found for path: {}", path);
            logger.debug("   Token preview: {}...", token.substring(0, Math.min(30, token.length())));

            try {
                // Validate token
                if (jwtUtil.validateToken(token)) {
                    String userId = jwtUtil.extractUserId(token);

                    logger.info("✅ Token valid - User ID: {}", userId);

                    // Create authentication object
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            Collections.emptyList());

                    // Set SecurityContext with the authentication
                    return chain.filter(exchange)
                            .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication));
                } else {
                    logger.error("❌ Token validation failed for path: {}", path);
                }
            } catch (Exception e) {
                logger.error("❌ Error processing JWT token: {}", e.getMessage());
            }
        } else {
            logger.warn("⚠️ No Authorization header found for protected path: {}", path);
        }

        // Continue without authentication (will be caught by Spring Security)
        return chain.filter(exchange);
    }

    private boolean isPublicPath(String path) {
        return path.startsWith("/api/auth/") ||
                path.startsWith("/oauth2/") ||
                path.startsWith("/login/oauth2/") ||
                path.startsWith("/api/health/") ||
                path.startsWith("/actuator/");
    }
}