package com.fintrack.gateway.filter;

import com.fintrack.gateway.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
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

            // Development mode bypass
            if (isDevelopmentMode()) {
                log.debug("🔓 DEV MODE: Bypassing authentication");
                ServerHttpRequest modifiedRequest = request.mutate()
                        .header("X-User-Id", defaultUserId)
                        .build();
                return chain.filter(exchange.mutate().request(modifiedRequest).build());
            }

            // Check for Authorization header
            if (!request.getHeaders().containsKey("Authorization")) {
                log.warn("Missing Authorization header");
                return onError(exchange, "Missing Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Invalid Authorization header format");
                return onError(exchange, "Invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            try {
                // Validate token
                if (!jwtUtil.validateToken(token)) {
                    log.warn("Invalid or expired token");
                    return onError(exchange, "Invalid or expired token", HttpStatus.UNAUTHORIZED);
                }

                // Extract user ID from token
                String userId = jwtUtil.extractUserId(token);

                if (userId == null || userId.isEmpty()) {
                    log.warn("Token does not contain user ID");
                    return onError(exchange, "Invalid token payload", HttpStatus.UNAUTHORIZED);
                }

                // Add user ID to request headers for downstream services
                ServerHttpRequest modifiedRequest = request.mutate()
                        .header("X-User-Id", userId)
                        .build();

                log.debug("✅ Authentication successful for user: {}", userId);
                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (Exception e) {
                log.error("Authentication error: ", e);
                return onError(exchange, "Authentication failed", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private boolean isDevelopmentMode() {
        return devBypassAuth || "dev".equalsIgnoreCase(environment) || "development".equalsIgnoreCase(environment);
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        log.error("Authentication error: {} - Status: {}", message, status);
        return response.setComplete();
    }

    public static class Config {
        // Configuration properties if needed
    }
}