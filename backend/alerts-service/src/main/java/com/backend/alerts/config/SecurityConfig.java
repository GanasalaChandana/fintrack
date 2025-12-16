package com.backend.alerts.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Security Configuration for Alerts Service
 * 
 * CRITICAL FIXES:
 * - Disables HTTP Basic Auth (no browser popup)
 * - Disables form login (no redirects)
 * - Disables logout (not needed for stateless API)
 * - Allows all requests (API Gateway handles authentication)
 * - Stateless session management (REST API pattern)
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(CorsConfigurationSource corsConfigurationSource) {
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // ✅ Enable CORS using our CorsConfig bean
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // ✅ Disable CSRF for REST APIs (gateway handles this)
                .csrf(csrf -> csrf.disable())

                // ✅ CRITICAL: Disable HTTP Basic Auth (prevents browser login popup)
                .httpBasic(httpBasic -> httpBasic.disable())

                // ✅ CRITICAL: Disable form login (prevents redirects to login page)
                .formLogin(formLogin -> formLogin.disable())

                // ✅ Disable logout (not needed for stateless API)
                .logout(logout -> logout.disable())

                // ✅ Stateless session management (REST API pattern)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // ✅ Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Allow actuator health check without auth
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        // Allow all other requests (API Gateway handles authentication)
                        .anyRequest().permitAll());

        return http.build();
    }
}