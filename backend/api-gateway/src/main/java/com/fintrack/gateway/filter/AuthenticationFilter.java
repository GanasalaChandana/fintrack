package com.fintrack.gateway.filter;

import com.fintrack.gateway.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${app.environment:production}")
    private String environment;

    @Value("${app.dev.bypass-auth:false}")
    private boolean devBypassAuth;

    @Value("${app.dev.default-user-id:dev-user-123}")
    private String defaultUserId;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            log.debug("🔍 Processing request: {} {}", request.getMethod(), request.getURI().getPath());

            // Development mode bypass
            if (isDevelopmentMode()) {
                log.warn("🔓 DEV MODE: Bypassing authentication, using default user ID: {}", defaultUserId);
                ServerHttpRequest modifiedRequest = request.mutate()
                        .header("X-User-Id", defaultUserId)
                        .build();
                return chain.filter(exchange.mutate().request(modifiedRequest).build());
            }

            // Check for Authorization header
            if (!request.getHeaders().containsKey("Authorization")) {
                log.warn("❌ Missing Authorization header for: {}", request.getURI().getPath());
                return onError(exchange, "Missing Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("❌ Invalid Authorization header format");
                return onError(exchange, "Invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);
            log.debug("🔑 Extracted token (first 20 chars): {}...", token.substring(0, Math.min(20, token.length())));

            try {
                // Validate token
                if (!jwtUtil.validateToken(token)) {
                    log.warn("❌ Invalid or expired token");
                    return onError(exchange, "Invalid or expired token", HttpStatus.UNAUTHORIZED);
                }

                // Extract user ID from token
                String userId = jwtUtil.extractUserId(token);

                if (userId == null || userId.isEmpty()) {
                    log.warn("❌ Token does not contain user ID");
                    return onError(exchange, "Invalid token payload", HttpStatus.UNAUTHORIZED);
                }

                // ✅ FIXED: Forward both the Authorization header AND add X-User-Id
                ServerHttpRequest modifiedRequest = request.mutate()
                        .header(HttpHeaders.AUTHORIZATION, authHeader) // ✅ Forward the original token
                        .header("X-User-Id", userId) // ✅ Add user ID for convenience
                        .build();

                log.info("✅ Authentication successful for user: {} | Route: {}", userId, request.getURI().getPath());
                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (Exception e) {
                log.error("❌ Authentication error: {}", e.getMessage(), e);
                return onError(exchange, "Authentication failed: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private boolean isDevelopmentMode() {
        boolean isDev = devBypassAuth || "dev".equalsIgnoreCase(environment)
                || "development".equalsIgnoreCase(environment);
        if (isDev) {
            log.debug("Running in development mode (auth bypass: {}, environment: {})", devBypassAuth, environment);
        }
        return isDev;
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        log.error("🚫 Authentication error: {} - Status: {}", message, status);
        return response.setComplete();
    }

    public static class Config {
        // Configuration properties if needed in the future
    }
}