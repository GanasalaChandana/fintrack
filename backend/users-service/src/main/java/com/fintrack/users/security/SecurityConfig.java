package com.fintrack.users.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                // CORS + CSRF
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(AbstractHttpConfigurer::disable)

                                // Stateless API
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // Authorization rules
                                .authorizeHttpRequests(auth -> auth
                                                // Allow all OPTIONS for CORS preflight
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                                                // Public auth endpoints
                                                .requestMatchers(
                                                                "/api/auth/**",
                                                                "/actuator/**",
                                                                "/error")
                                                .permitAll()

                                                // Everything else requires auth (if/when you add JWT etc.)
                                                .anyRequest().authenticated())

                                // No built-in login UI / basic auth popups
                                .httpBasic(AbstractHttpConfigurer::disable)
                                .formLogin(AbstractHttpConfigurer::disable);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                // Only browser origins that should talk to this service
                configuration.setAllowedOrigins(List.of(
                                "http://localhost:3000", // Next.js dev
                                "http://127.0.0.1:3000",
                                "http://localhost:5173", // Vite (if you use it)
                                "http://127.0.0.1:5173",
                                "http://localhost:8080", // API gateway
                                "http://127.0.0.1:8080",
                                "https://fintrack-liart.vercel.app" // production frontend
                ));

                configuration.setAllowedMethods(List.of(
                                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));

                configuration.setAllowedHeaders(List.of("*"));

                configuration.setExposedHeaders(List.of(
                                "Authorization",
                                "Content-Type"));

                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L); // cache preflight 1 hour

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
