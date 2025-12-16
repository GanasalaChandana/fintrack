package com.fintrack.gateway.config;

import com.fintrack.gateway.filter.JwtAuthenticationWebFilter;
import com.fintrack.gateway.util.JwtUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtUtil jwtUtil, CorsConfigurationSource corsConfigurationSource) {
        this.jwtUtil = jwtUtil;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public JwtAuthenticationWebFilter jwtAuthenticationWebFilter() {
        return new JwtAuthenticationWebFilter(jwtUtil);
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                // ✅ CRITICAL: Disable sessions - we're using JWT tokens
                .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())

                // ✅ Enable CORS with our custom configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // ✅ Disable CSRF for REST APIs
                .csrf(ServerHttpSecurity.CsrfSpec::disable)

                // ✅ CRITICAL: Disable HTTP Basic Auth (prevents browser login popup)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)

                // ✅ CRITICAL: Disable form login
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)

                // ✅ Configure authorization
                .authorizeExchange(exchange -> exchange
                        // ✅ CRITICAL: Allow ALL OPTIONS requests (CORS preflight)
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ✅ Public auth endpoints
                        .pathMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/google",
                                "/api/auth/google/**",
                                "/oauth2/**",
                                "/login/oauth2/code/**")
                        .permitAll()

                        // ✅ Health check endpoints
                        .pathMatchers("/api/health/**", "/actuator/**").permitAll()

                        // ✅ All other requests require authentication
                        .anyExchange().authenticated())

                // ✅ Add JWT authentication filter
                .addFilterAt(jwtAuthenticationWebFilter(),
                        SecurityWebFiltersOrder.AUTHENTICATION)

                .build();
    }
}