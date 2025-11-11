package com.fintrack.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        // Allow your frontend origins
        corsConfig.setAllowedOrigins(Arrays.asList(
                "https://fintrack-liart.vercel.app",
                "http://localhost:3000",
                "http://localhost:5173"));

        // Allow credentials (cookies, authorization headers)
        corsConfig.setAllowCredentials(true);

        // Allow all HTTP methods
        corsConfig.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Allow all headers
        corsConfig.setAllowedHeaders(Arrays.asList("*"));

        // Expose headers that frontend can access
        corsConfig.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type"));

        // How long preflight requests can be cached (in seconds)
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}