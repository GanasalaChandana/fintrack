package com.fintrack.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
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
 * Simple, Secure CORS Configuration for API Gateway
 * 
 * This config is MINIMAL and SECURE:
 * - Only allows YOUR frontend domains
 * - No overly permissive wildcards
 * - Works with Google OAuth (because requests come from YOUR frontend)
 * 
 * NOTE: If you get CORS errors from accounts.google.com,
 * add it to ALLOWED_ORIGINS. But test without it first!
 */
@Configuration
public class GlobalCorsConfiguration {

    private static final List<String> ALLOWED_ORIGINS = Arrays.asList(
            // Production
            "https://fintrack-liart.vercel.app",

            // Local Development
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://127.0.0.1:3000");

    private static final List<String> ALLOWED_METHODS = Arrays.asList(
            HttpMethod.GET.name(),
            HttpMethod.POST.name(),
            HttpMethod.PUT.name(),
            HttpMethod.DELETE.name(),
            HttpMethod.PATCH.name(),
            HttpMethod.OPTIONS.name());

    @Bean
    @Order(-1)
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration cors = new CorsConfiguration();

        cors.setAllowCredentials(true);
        cors.setAllowedOriginPatterns(ALLOWED_ORIGINS);
        cors.setAllowedHeaders(Arrays.asList("*"));
        cors.setAllowedMethods(ALLOWED_METHODS);
        cors.setExposedHeaders(Arrays.asList(
                HttpHeaders.AUTHORIZATION,
                "X-User-Id",
                "X-Auth-Token"));
        cors.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);

        return new CorsWebFilter(source);
    }

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

                if (origin != null && isAllowedOrigin(origin)) {
                    resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
                    resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
                    resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS,
                            String.join(", ", ALLOWED_METHODS));

                    List<String> requestedHeaders = reqHeaders.getAccessControlRequestHeaders();
                    if (requestedHeaders != null && !requestedHeaders.isEmpty()) {
                        resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS,
                                String.join(", ", requestedHeaders));
                    } else {
                        resHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "*");
                    }

                    resHeaders.set(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS,
                            "Authorization, X-User-Id, X-Auth-Token");
                    resHeaders.set(HttpHeaders.ACCESS_CONTROL_MAX_AGE, "3600");

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

    private boolean isAllowedOrigin(String origin) {
        if (origin == null || origin.isEmpty()) {
            return false;
        }

        // Exact match
        if (ALLOWED_ORIGINS.contains(origin)) {
            return true;
        }

        // Allow YOUR preview deployments only
        if (origin.startsWith("https://fintrack-liart-") &&
                origin.endsWith(".vercel.app")) {
            return true;
        }

        // Development - any localhost/127.0.0.1 port
        if (origin.startsWith("http://localhost:") ||
                origin.startsWith("http://127.0.0.1:")) {
            return true;
        }

        return false;
    }
}