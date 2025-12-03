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
 * FIXED: Enhanced Google OAuth support and better origin validation
 */
@Configuration
public class GlobalCorsConfiguration {

    // ✅ ENHANCED: Added more Google OAuth domains
    private static final List<String> ALLOWED_ORIGIN_PATTERNS = Arrays.asList(
            // Production
            "https://fintrack-liart.vercel.app",

            // Local Development
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3001",

            // ✅ GOOGLE OAUTH ORIGINS - COMPLETE LIST
            "https://accounts.google.com",
            "https://content-accounts.google.com",
            "https://gsi.google.com",
            "https://www.google.com",
            "https://google.com",
            "https://oauth.googleusercontent.com",
            "https://apis.google.com");

    private static final List<String> ALLOWED_METHODS = Arrays.asList(
            HttpMethod.GET.name(),
            HttpMethod.POST.name(),
            HttpMethod.PUT.name(),
            HttpMethod.DELETE.name(),
            HttpMethod.PATCH.name(),
            HttpMethod.OPTIONS.name(),
            HttpMethod.HEAD.name());

    // ✅ ENHANCED: Added more headers for Google OAuth
    private static final List<String> ALLOWED_HEADERS = Arrays.asList(
            HttpHeaders.AUTHORIZATION,
            HttpHeaders.CONTENT_TYPE,
            HttpHeaders.ACCEPT,
            HttpHeaders.ORIGIN,
            HttpHeaders.REFERER,
            HttpHeaders.USER_AGENT,
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
            "X-User-Id",
            // Google OAuth specific headers
            "X-Client-Data",
            "X-Goog-AuthUser",
            "X-Goog-Encode-Response-If-Executable",
            "X-Goog-Visitor-Id",
            "X-OAuth-State",
            "X-Origin",
            // Common auth headers
            "credentials",
            "withCredentials");

    private static final List<String> EXPOSED_HEADERS = Arrays.asList(
            HttpHeaders.AUTHORIZATION,
            HttpHeaders.CONTENT_TYPE,
            HttpHeaders.LOCATION,
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
            "X-User-Id",
            "X-Auth-Token");

    @Bean
    @Order(-1)
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration cors = new CorsConfiguration();

        // ✅ CRITICAL: Allow credentials for OAuth
        cors.setAllowCredentials(true);

        // ✅ Use explicit origins (required with credentials)
        cors.setAllowedOriginPatterns(ALLOWED_ORIGIN_PATTERNS);

        // Allow all headers (safest for OAuth)
        cors.setAllowedHeaders(Arrays.asList("*"));

        // ✅ CRITICAL: Allow all methods
        cors.setAllowedMethods(ALLOWED_METHODS);

        // Expose headers
        cors.setExposedHeaders(EXPOSED_HEADERS);

        // ✅ INCREASED: Cache preflight for 2 hours (reduces preflight requests)
        cors.setMaxAge(7200L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);

        return new CorsWebFilter(source);
    }

    /**
     * ✅ ENHANCED: More permissive preflight handler for OAuth flows
     */
    @Bean
    @Order(-2)
    public WebFilter corsPreflightFilter() {
        return (ServerWebExchange exchange, WebFilterChain chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            if (HttpMethod.OPTIONS.equals(request.getMethod())) {
                ServerHttpResponse response = exchange.getResponse();
                HttpHeaders reqHeaders = request.getHeaders();
                HttpHeaders resHeaders = response.getHeaders();

                String origin = reqHeaders.getOrigin();

                // ✅ ENHANCED: More permissive origin check
                if (origin != null && isAllowedOrigin(origin)) {
                    // Set CORS headers
                    resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
                    resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

                    // ✅ CRITICAL: Allow all methods for preflight
                    resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS,
                            String.join(", ", ALLOWED_METHODS));

                    // ✅ CRITICAL: Allow all requested headers
                    List<String> requestedHeaders = reqHeaders.getAccessControlRequestHeaders();
                    if (requestedHeaders != null && !requestedHeaders.isEmpty()) {
                        resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS,
                                String.join(", ", requestedHeaders));
                    } else {
                        resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "*");
                    }

                    // Expose headers
                    resHeaders.set(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS,
                            String.join(", ", EXPOSED_HEADERS));

                    // ✅ INCREASED: Cache for 2 hours
                    resHeaders.set(HttpHeaders.ACCESS_CONTROL_MAX_AGE, "7200");

                    // Vary headers for caching
                    resHeaders.add(HttpHeaders.VARY, "Origin");
                    resHeaders.add(HttpHeaders.VARY, "Access-Control-Request-Method");
                    resHeaders.add(HttpHeaders.VARY, "Access-Control-Request-Headers");
                }

                response.setStatusCode(HttpStatus.OK);
                return Mono.empty();
            }

            return chain.filter(exchange);
        };
    }

    /**
     * ✅ ENHANCED: More permissive origin validation for OAuth
     */
    private boolean isAllowedOrigin(String origin) {
        if (origin == null || origin.isEmpty()) {
            return false;
        }

        // Exact match
        if (ALLOWED_ORIGIN_PATTERNS.contains(origin)) {
            return true;
        }

        // ✅ ENHANCED: Google domains - any Google subdomain
        if (origin.startsWith("https://") &&
                (origin.contains(".google.com") ||
                        origin.contains(".googleusercontent.com") ||
                        origin.contains(".googleapis.com"))) {
            return true;
        }

        // ✅ ENHANCED: Vercel deployments
        if (origin.startsWith("https://") && origin.contains(".vercel.app")) {
            return true;
        }

        // ✅ ENHANCED: Development - any localhost port
        if (origin.startsWith("http://localhost:") ||
                origin.startsWith("http://127.0.0.1:")) {
            return true;
        }

        return false;
    }
}