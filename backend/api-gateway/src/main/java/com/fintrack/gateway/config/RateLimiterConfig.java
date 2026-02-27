package com.fintrack.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import reactor.core.publisher.Mono;

@Configuration
public class RateLimiterConfig {

    /**
     * Rate limiter for auth endpoints: 10 requests/second, burst of 20.
     */
    @Bean
    @Primary
    public RedisRateLimiter authRateLimiter() {
        return new RedisRateLimiter(10, 20, 1);
    }

    /**
     * Rate limiter for general API endpoints: 50 requests/second, burst of 100.
     */
    @Bean
    public RedisRateLimiter apiRateLimiter() {
        return new RedisRateLimiter(50, 100, 1);
    }

    /**
     * Key resolver: use the client IP address for rate limiting.
     * Falls back to "unknown" if the IP cannot be determined.
     */
    @Bean
    @Primary
    public KeyResolver ipKeyResolver() {
        return exchange -> {
            String ip = exchange.getRequest().getRemoteAddress() != null
                    ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                    : "unknown";
            return Mono.just(ip);
        };
    }
}
