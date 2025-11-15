package com.fintrack.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

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
                corsConfig.setAllowedOrigins(Arrays.asList(
                                "https://fintrack-liart.vercel.app",
                                "http://localhost:3000",
                                "http://localhost:5173"));

                // Allow all headers from the client
                corsConfig.setAllowedHeaders(Collections.singletonList("*"));

                // Allow these HTTP methods
                corsConfig.setAllowedMethods(Arrays.asList(
                                "GET",
                                "POST",
                                "PUT",
                                "DELETE",
                                "PATCH",
                                "OPTIONS",
                                "HEAD"));

                // Expose these headers to the client
                corsConfig.setExposedHeaders(Arrays.asList(
                                "Authorization",
                                "Content-Type",
                                "X-Requested-With",
                                "Accept",
                                "Origin",
                                "Access-Control-Request-Method",
                                "Access-Control-Request-Headers"));

                // Cache preflight requests for 1 hour
                corsConfig.setMaxAge(3600L);

                // Apply this configuration to all paths
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", corsConfig);

                return new CorsWebFilter(source);
        }
}