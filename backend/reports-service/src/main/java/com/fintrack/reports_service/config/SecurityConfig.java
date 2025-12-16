package com.fintrack.reports_service.config; // ← Change package name for each service

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

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
                // Enable CORS using our CorsConfig bean
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // Disable CSRF for REST APIs
                .csrf(csrf -> csrf.disable())

                // ✅ CRITICAL: Disable HTTP Basic Auth (prevents browser popup)
                .httpBasic(httpBasic -> httpBasic.disable())

                // ✅ CRITICAL: Disable form login
                .formLogin(formLogin -> formLogin.disable())

                // Stateless session (for REST APIs)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Allow all requests (gateway handles auth)
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll());

        return http.build();
    }
}
