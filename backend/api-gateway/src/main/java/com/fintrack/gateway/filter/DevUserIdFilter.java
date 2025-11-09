package com.fintrack.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Development filter that injects X-User-Id header when missing.
 * DISABLE THIS IN PRODUCTION!
 */
@Component
@Slf4j
public class DevUserIdFilter implements GlobalFilter, Ordered {

    @Value("${app.environment:prod}")
    private String environment;

    @Value("${app.dev.default-user-id:dev-user-123}")
    private String defaultUserId;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // Only apply in development mode
        if (!"dev".equals(environment) && !"development".equals(environment)) {
            return chain.filter(exchange);
        }

        ServerHttpRequest request = exchange.getRequest();

        // Check if X-User-Id header already exists
        if (request.getHeaders().containsKey("X-User-Id")) {
            log.debug("X-User-Id header already present");
            return chain.filter(exchange);
        }

        // Inject default user ID for development
        log.warn("⚠️ DEV MODE: Injecting X-User-Id header: {}", defaultUserId);

        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-Id", defaultUserId)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() {
        return -1; // Execute before other filters
    }
}