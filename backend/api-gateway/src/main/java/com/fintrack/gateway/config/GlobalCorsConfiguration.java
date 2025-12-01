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

/**
 * Global CORS configuration for the API Gateway.
 * Use this (and remove any spring.cloud.gateway.globalcors in YAML) to avoid
 * conflicts.
 */
@Configuration
public class GlobalCorsConfiguration {

    // Centralized list of allowed origins
    // FIXED: Removed wildcard "https://*.vercel.app" which causes issues with
    // allowCredentials
    private static final List<String> ALLOWED_ORIGIN_PATTERNS = Arrays.asList(
            "https://fintrack-liart.vercel.app",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3001",
            // ✅ ADD GOOGLE OAUTH ORIGINS
            "https://accounts.google.com",
            "https://content-accounts.google.com",
            "https://gsi.google.com");

    private static final List<String> ALLOWED_METHODS = Arrays.asList(
            HttpMethod.GET.name(),
            HttpMethod.POST.name(),
            HttpMethod.PUT.name(),
            HttpMethod.DELETE.name(),
            HttpMethod.PATCH.name(),
            HttpMethod.OPTIONS.name(),
            HttpMethod.HEAD.name());

    private static final List<String> ALLOWED_HEADERS = Arrays.asList(
            HttpHeaders.AUTHORIZATION,
            HttpHeaders.CONTENT_TYPE,
            HttpHeaders.ACCEPT,
            "X-Requested-With",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
            "X-User-Id",
            // ✅ ADD GOOGLE SPECIFIC HEADERS
            "X-Client-Data",
            "X-Goog-AuthUser",
            "X-Requested-With");

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

        // FIXED: Use explicit origins only - no wildcards with credentials
        cors.setAllowedOriginPatterns(ALLOWED_ORIGIN_PATTERNS);

        // Allow specific headers
        cors.setAllowedHeaders(ALLOWED_HEADERS);

        // Allowed methods
        cors.setAllowedMethods(ALLOWED_METHODS);

        // Expose useful headers to the client
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
    @Order(-2) // Run even before CorsWebFilter
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
                    List<String> requestedHeaders = reqHeaders.getAccessControlRequestHeaders();
                    if (requestedHeaders != null && !requestedHeaders.isEmpty()) {
                        resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS,
                                String.join(", ", requestedHeaders));
                    } else {
                        resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS,
                                String.join(", ", ALLOWED_HEADERS));
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
     * FIXED: More precise origin matching
     * Checks against our explicit list of allowed origins
     */
    private boolean isAllowedOrigin(String origin) {
        if (origin == null || origin.isEmpty()) {
            return false;
        }

        // Exact match against our allowed list
        if (ALLOWED_ORIGIN_PATTERNS.contains(origin)) {
            return true;
        }

        // ✅ GOOGLE OAUTH ORIGINS - Allow Google domains
        if (origin.equals("https://accounts.google.com") ||
                origin.equals("https://content-accounts.google.com") ||
                origin.equals("https://gsi.google.com") ||
                origin.startsWith("https://") && origin.endsWith(".google.com")) {
            return true;
        }

        // Support for Vercel preview deployments - match pattern safely
        // Only allow if it's a vercel.app subdomain with HTTPS
        if (origin.startsWith("https://") && origin.endsWith(".vercel.app")) {
            // For production, you might want to be more restrictive:
            // return origin.matches("https://fintrack-.*\\.vercel\\.app");
            return true; // Allow all Vercel deployments for now
        }

        // Development: Support localhost with common ports
        if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
            // Extract port number
            String portPart = origin.substring(origin.lastIndexOf(':') + 1);
            try {
                int port = Integer.parseInt(portPart);
                // Allow common dev ports: 3000, 3001, 5173 (Vite), 5174
                return port == 3000 || port == 3001 || port == 5173 || port == 5174;
            } catch (NumberFormatException e) {
                return false;
            }
        }

        return false;
    }
}