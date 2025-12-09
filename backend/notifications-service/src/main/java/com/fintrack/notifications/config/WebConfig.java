package com.fintrack.notifications.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

/**
 * CORS Configuration for Notification Service
 * Allows frontend (localhost:3000) to make requests to this service
 * (localhost:8086)
 * 
 * This configuration:
 * 1. Enables CORS for all /api/** endpoints
 * 2. Allows requests from the Next.js frontend at localhost:3000
 * 3. Permits all standard HTTP methods and headers
 * 4. Enables credentials (cookies, authorization headers)
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .maxAge(3600);
    }

    /**
     * Alternative CORS configuration using CorsFilter
     * Use this if the WebMvcConfigurer approach doesn't work
     * (Some Spring Boot versions prefer one over the other)
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow frontend origin
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));

        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Expose Authorization header to frontend
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        // Allow credentials (cookies, auth headers)
        configuration.setAllowCredentials(true);

        // Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }

    @Bean
    public CorsFilter corsFilter() {
        return new CorsFilter(corsConfigurationSource());
    }
}