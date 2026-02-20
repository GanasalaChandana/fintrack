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

        // ✅ CorsWebFilter applies CORS at the WebFlux filter level —
        // this ensures CORS headers are present on ALL responses,
        // including 4xx/5xx errors from downstream or Render's rate limiter (429)
        @Bean
        public CorsWebFilter corsWebFilter() {
                return new CorsWebFilter(corsConfigurationSource());
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();

                config.setAllowedOriginPatterns(Arrays.asList(
                                "http://localhost:3000",
                                "http://localhost:3001",
                                "https://fintrack-liart.vercel.app",
                                "https://fintrack-liart-*.vercel.app"));

                config.setAllowedMethods(Arrays.asList(
                                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

                config.setAllowedHeaders(Arrays.asList("*"));

                config.setExposedHeaders(Arrays.asList(
                                "Authorization",
                                "X-User-Id",
                                "Content-Type"));

                config.setAllowCredentials(true);
                config.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);

                return source;
        }
}