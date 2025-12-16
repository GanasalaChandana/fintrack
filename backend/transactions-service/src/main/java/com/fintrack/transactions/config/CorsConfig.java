package com.fintrack.transactions.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                // Allow all localhost ports and production domains
                configuration.setAllowedOriginPatterns(Arrays.asList(
                                "http://localhost:*",
                                "http://127.0.0.1:*",
                                "https://fintrack-liart.vercel.app",
                                "https://fintrack-liart-*.vercel.app",
                                "https://*.vercel.app",
                                "https://fintrack-api-gateway.onrender.com"));

                // Allow all standard HTTP methods
                configuration.setAllowedMethods(Arrays.asList(
                                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));

                // Allow all headers
                configuration.setAllowedHeaders(List.of("*"));

                // Expose important headers to the client
                configuration.setExposedHeaders(Arrays.asList(
                                "Authorization",
                                "X-User-Id",
                                "Content-Type",
                                "X-Requested-With"));

                // Allow credentials (cookies, authorization headers)
                configuration.setAllowCredentials(true);

                // Cache preflight response for 1 hour
                configuration.setMaxAge(3600L);

                // Register CORS config for all paths
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);

                return source;
        }
}