package com.fintrack.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();

                // Allow your frontend origins
                config.setAllowedOriginPatterns(Arrays.asList(
                                "http://localhost:3000",
                                "http://localhost:3001",
                                "https://fintrack-liart.vercel.app",
                                "https://fintrack-liart-*.vercel.app",
                                "https://fintrack-api-gateway.onrender.com"));

                // Allow all HTTP methods
                config.setAllowedMethods(Arrays.asList(
                                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

                // Allow all headers
                config.setAllowedHeaders(Arrays.asList("*"));

                // Expose headers
                config.setExposedHeaders(Arrays.asList(
                                "Authorization",
                                "X-User-Id",
                                "Content-Type"));

                // Allow credentials (cookies, authorization headers)
                config.setAllowCredentials(true);

                // Cache preflight response for 1 hour
                config.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);

                return source;
        }

        @Bean
        public CorsWebFilter corsWebFilter() {
                return new CorsWebFilter(corsConfigurationSource());
        }
}