package com.fintrack.gateway.config;

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

/**
 * Global CORS configuration for the API Gateway
 * This ensures all requests from allowed origins can access the gateway
 */
@Configuration
public class GlobalCorsConfiguration {

        @Bean
        public CorsWebFilter corsWebFilter() {
                CorsConfiguration corsConfig = new CorsConfiguration();

                // CRITICAL: Allow credentials (cookies, authorization headers)
                corsConfig.setAllowCredentials(true);

                // Allow requests from these origins
                corsConfig.setAllowedOriginPatterns(Arrays.asList(
                                "https://fintrack-liart.vercel.app",
                                "http://localhost:3000",
                                "http://localhost:5173",
                                "https://*.vercel.app" // Allow all Vercel preview deployments
                ));

                // Allow all headers from the client
                corsConfig.setAllowedHeaders(Arrays.asList("*"));

                // Allow these HTTP methods
                corsConfig.setAllowedMethods(Arrays.asList(
                                HttpMethod.GET.name(),
                                HttpMethod.POST.name(),
                                HttpMethod.PUT.name(),
                                HttpMethod.DELETE.name(),
                                HttpMethod.PATCH.name(),
                                HttpMethod.OPTIONS.name(),
                                HttpMethod.HEAD.name()));

                // Expose these headers to the client
                corsConfig.setExposedHeaders(Arrays.asList(
                                HttpHeaders.AUTHORIZATION,
                                HttpHeaders.CONTENT_TYPE,
                                "X-Requested-With",
                                "Accept",
                                "Origin",
                                "Access-Control-Request-Method",
                                "Access-Control-Request-Headers",
                                "X-User-Id"));

                // Cache preflight requests for 1 hour
                corsConfig.setMaxAge(3600L);

                // Apply this configuration to all paths
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", corsConfig);

                return new CorsWebFilter(source);
        }

        /**
         * Additional WebFilter to handle OPTIONS requests explicitly
         * This ensures preflight requests are handled correctly
         */
        @Bean
        public WebFilter corsPreflightFilter() {
                return (ServerWebExchange exchange, WebFilterChain chain) -> {
                        ServerHttpRequest request = exchange.getRequest();

                        if (HttpMethod.OPTIONS.equals(request.getMethod())) {
                                ServerHttpResponse response = exchange.getResponse();
                                HttpHeaders headers = response.getHeaders();

                                String origin = request.getHeaders().getOrigin();
                                if (origin != null && (origin.equals("https://fintrack-liart.vercel.app") ||
                                                origin.startsWith("http://localhost") ||
                                                origin.endsWith(".vercel.app"))) {
                                        headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
                                        headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
                                        headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS,
                                                        "GET, POST, PUT, DELETE, PATCH, OPTIONS");
                                        headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "*");
                                        headers.add(HttpHeaders.ACCESS_CONTROL_MAX_AGE, "3600");
                                }

                                response.setStatusCode(HttpStatus.OK);
                                return Mono.empty();
                        }

                        return chain.filter(exchange);
                };
        }
}