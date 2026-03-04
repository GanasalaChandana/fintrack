package com.fintrack.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Adds CORS headers to EVERY response that leaves the gateway — including
 * 429 / 5xx responses proxied from downstream Render services.
 *
 * Why this is needed:
 * CorsWebFilter handles preflight OPTIONS and adds headers for requests
 * the gateway processes directly. But when a downstream service (alerts,
 * notifications, reports) returns a 429 or 503, the gateway proxies that
 * response straight back. CorsWebFilter doesn't re-run on the response
 * path, so the browser sees a 429 with no Access-Control-Allow-Origin
 * and reports it as a CORS error — hiding the real rate-limit problem.
 *
 * This filter runs at order HIGHEST_PRECEDENCE + 1 so it executes last on
 * the response path (filters run in reverse on the way out), guaranteeing
 * CORS headers are always present regardless of what downstream returned.
 */
@Component
public class GlobalCorsResponseFilter implements GlobalFilter, Ordered {

    private static final List<String> ALLOWED_ORIGINS = List.of(
            "http://localhost:3000",
            "http://localhost:3001",
            "https://fintrack-liart.vercel.app");

    @Override
    public int getOrder() {
        // Negative = runs early on request path, late on response path
        // This ensures we write headers after downstream response is received
        return Ordered.HIGHEST_PRECEDENCE + 1;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            HttpHeaders responseHeaders = exchange.getResponse().getHeaders();

            // Only add if not already set (respect CorsWebFilter if it ran)
            if (!responseHeaders.containsKey(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN)) {
                String origin = exchange.getRequest().getHeaders().getFirst(HttpHeaders.ORIGIN);

                if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
                    responseHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
                    responseHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
                    responseHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS,
                            "GET, POST, PUT, PATCH, DELETE, OPTIONS");
                    responseHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "*");
                    responseHeaders.set(HttpHeaders.ACCESS_CONTROL_MAX_AGE, "3600");
                }
            }
        }));
    }
}