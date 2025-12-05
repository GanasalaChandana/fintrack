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
                                // ✅ CORS + CSRF
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(AbstractHttpConfigurer::disable)

                                // ✅ Stateless API (no sessions)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // ✅ Authorization rules
                                .authorizeHttpRequests(auth -> auth
                                                // Allow all OPTIONS requests for CORS preflight
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                                                // 🔓 Public auth + oauth endpoints (no token required)
                                                .requestMatchers(
                                                                "/api/auth/**", // register, login, google, etc.
                                                                "/oauth2/**", // Spring Security OAuth2 endpoints
                                                                "/login/oauth2/**",
                                                                "/actuator/**",
                                                                "/error")
                                                .permitAll()

                                                // 🔒 Everything else requires authentication
                                                .anyRequest().authenticated())

                                // ✅ Disable default login mechanisms
                                .httpBasic(AbstractHttpConfigurer::disable)
                                .formLogin(AbstractHttpConfigurer::disable)
                                .logout(AbstractHttpConfigurer::disable);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                // ✅ Exact origins
                configuration.setAllowedOrigins(List.of(
                                "http://localhost:3000",
                                "http://127.0.0.1:3000",
                                "http://localhost:5173",
                                "http://127.0.0.1:5173",
                                "http://localhost:8080", // API gateway
                                "http://127.0.0.1:8080",
                                "https://fintrack-liart.vercel.app"));

                // ✅ Wildcard for Vercel preview deployments
                configuration.setAllowedOriginPatterns(List.of(
                                "https://fintrack-liart-*.vercel.app"));

                configuration.setAllowedMethods(List.of(
                                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));

                configuration.setAllowedHeaders(List.of("*"));

                configuration.setExposedHeaders(List.of(
                                "Authorization", "Content-Type", "Accept"));

                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
