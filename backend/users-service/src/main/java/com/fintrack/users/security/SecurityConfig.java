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

import java.util.Arrays;
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

                                                // Public auth endpoints - no authentication required
                                                .requestMatchers(
                                                                "/api/auth/**",
                                                                "/api/auth/register",
                                                                "/api/auth/login",
                                                                "/api/auth/google",
                                                                "/api/auth/health",
                                                                "/actuator/**",
                                                                "/error")
                                                .permitAll()

                                                // Everything else requires authentication
                                                .anyRequest().authenticated())

                                // ✅ Disable default login forms
                                .httpBasic(AbstractHttpConfigurer::disable)
                                .formLogin(AbstractHttpConfigurer::disable);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                // ✅ Allowed origins - your frontend URLs
                configuration.setAllowedOrigins(Arrays.asList(
                                // Local development
                                "http://localhost:3000",
                                "http://127.0.0.1:3000",
                                "http://localhost:5173", // Vite
                                "http://127.0.0.1:5173",
                                "http://localhost:8080", // API Gateway
                                "http://127.0.0.1:8080",

                                // Production frontend
                                "https://fintrack-liart.vercel.app",

                                // ✅ Add wildcard for Vercel preview deployments (optional)
                                "https://fintrack-liart-*.vercel.app"));

                // ✅ Allowed HTTP methods
                configuration.setAllowedMethods(Arrays.asList(
                                "GET",
                                "POST",
                                "PUT",
                                "DELETE",
                                "OPTIONS",
                                "PATCH",
                                "HEAD"));

                // ✅ Allow all headers (including Authorization, Content-Type, etc.)
                configuration.setAllowedHeaders(Arrays.asList("*"));

                // ✅ Expose headers to the frontend
                configuration.setExposedHeaders(Arrays.asList(
                                "Authorization",
                                "Content-Type",
                                "Accept",
                                "X-Requested-With",
                                "Access-Control-Allow-Origin"));

                // ✅ Allow credentials (cookies, authorization headers)
                configuration.setAllowCredentials(true);

                // ✅ Cache preflight requests for 1 hour (3600 seconds)
                configuration.setMaxAge(3600L);

                // ✅ Apply CORS configuration to all endpoints
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);

                return source;
        }
}