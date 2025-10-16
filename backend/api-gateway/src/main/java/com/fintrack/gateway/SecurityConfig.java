package com.fintrack.gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {
  @Bean
  public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
    // Open for starter; tighten later with JWT
    return http.csrf(ServerHttpSecurity.CsrfSpec::disable)
               .authorizeExchange(ex -> ex.anyExchange().permitAll())
               .build();
  }
}
