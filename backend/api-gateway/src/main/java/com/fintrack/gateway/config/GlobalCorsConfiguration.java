package com.fintrack.gateway.config;

import org.springframework.core.annotation.Order;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

/**
 * Global CORS configuration for the API Gateway.
 * Use this (and remove any spring.cloud.gateway.globalcors in YAML) to avoid
 * conflicts.
 */
@Configuration
public class GlobalCorsConfiguration {

        // Keep the list centralized so both filters agree.
        private static final List<String> ALLOWED_ORIGIN_PATTERNS = Arrays.asList(
                        "https://fintrack-liart.vercel.app",
                        "http://localhost:3000",
                        "http://localhost:5173",
                        "https://*.vercel.app" // allow all Vercel preview deployments
        );

        private static final List<String> ALLOWED_METHODS = Arrays.asList(
                        HttpMethod.GET.name(),
                        HttpMethod.POST.name(),
                        HttpMethod.PUT.name(),
                        HttpMethod.DELETE.name(),
                        HttpMethod.PATCH.name(),
                        HttpMethod.OPTIONS.name(),
                        HttpMethod.HEAD.name());

        private static final List<String> EXPOSED_HEADERS = Arrays.asList(
                        HttpHeaders.AUTHORIZATION,
                        HttpHeaders.CONTENT_TYPE,
                        "X-Requested-With",
                        "Accept",
                        "Origin",
                        "Access-Control-Request-Method",
                        "Access-Control-Request-Headers",
                        "X-User-Id");

        @Bean
        @Order(-1)
        public CorsWebFilter corsWebFilter() {
                CorsConfiguration cors = new CorsConfiguration();

                // Allow credentials (cookies, Authorization headers)
                cors.setAllowCredentials(true);

                // Use patterns so wildcard subdomains (e.g., *.vercel.app) are allowed.
                cors.setAllowedOriginPatterns(ALLOWED_ORIGIN_PATTERNS);

                // Allow any header from clients; preflight filter will echo requested headers
                // for safety.
                cors.setAllowedHeaders(Arrays.asList("*"));

                // Allowed methods
                cors.setAllowedMethods(ALLOWED_METHODS);

                // Expose a few useful headers to the client
                cors.setExposedHeaders(EXPOSED_HEADERS);

                // Cache preflight for 1 hour
                cors.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", cors);

                return new CorsWebFilter(source);
        }

        /**
         * Explicit, lightweight preflight handler.
         * This runs early, answers OPTIONS quickly, and sets proper Vary headers for
         * caches/CDNs.
         * Non-OPTIONS traffic proceeds to CorsWebFilter (which will set CORS response
         * headers).
         */
        @Bean
        public WebFilter corsPreflightFilter() {
                return (ServerWebExchange exchange, WebFilterChain chain) -> {
                        ServerHttpRequest request = exchange.getRequest();

                        if (HttpMethod.OPTIONS.equals(request.getMethod())) {
                                ServerHttpResponse response = exchange.getResponse();
                                HttpHeaders reqHeaders = request.getHeaders();
                                HttpHeaders resHeaders = response.getHeaders();

                                String origin = reqHeaders.getOrigin();
                                if (origin != null && isAllowedOrigin(origin)) {
                                        // Required for credentialed requests
                                        resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
                                        resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

                                        // Allow requested method if present; otherwise provide the full list
                                        if (reqHeaders.getAccessControlRequestMethod() != null) {
                                                resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS,
                                                                reqHeaders.getAccessControlRequestMethod().name());
                                        } else {
                                                resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS,
                                                                String.join(", ", ALLOWED_METHODS));
                                        }

                                        // Echo back requested headers if present; otherwise allow all
                                        Set<String> requested = reqHeaders.getAccessControlRequestHeaders();
                                        if (requested != null && !requested.isEmpty()) {
                                                resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS,
                                                                String.join(", ", requested));
                                        } else {
                                                resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "*");
                                        }

                                        // Expose headers commonly needed by clients
                                        resHeaders.set(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS,
                                                        String.join(", ", EXPOSED_HEADERS));

                                        // Preflight cache TTL
                                        resHeaders.set(HttpHeaders.ACCESS_CONTROL_MAX_AGE, "3600");

                                        // Help caches vary properly
                                        resHeaders.add(HttpHeaders.VARY, "Origin");
                                        resHeaders.add(HttpHeaders.VARY, "Access-Control-Request-Method");
                                        resHeaders.add(HttpHeaders.VARY, "Access-Control-Request-Headers");
                                }

                                response.setStatusCode(HttpStatus.OK);
                                return Mono.empty();
                        }

                        // For non-OPTIONS, let CorsWebFilter handle response headers
                        return chain.filter(exchange);
                };
        }

        /**
         * Minimal matcher for our allowed patterns. Spring's CorsConfiguration will
         * also enforce this,
         * but we need it here to decide what to set for preflights we short-circuit.
         */
        private boolean isAllowedOrigin(String origin) {
                // Exact matches
                if (ALLOWED_ORIGIN_PATTERNS.contains(origin))
                        return true;

                // Basic wildcard support for *.vercel.app
                if (origin.startsWith("https://") && origin.endsWith(".vercel.app"))
                        return true;

                // Localhost helpers if you decide to expand ports or add dev hosts later
                if (origin.startsWith("http://localhost:3000") || origin.startsWith("http://localhost:5173"))
                        return true;

                return false;
        }
}
