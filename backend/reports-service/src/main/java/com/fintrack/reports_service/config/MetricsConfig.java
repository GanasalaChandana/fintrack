package com.fintrack.reports_service.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MetricsConfig {

    @Bean
    public Counter reportGeneratedCounter(MeterRegistry registry) {
        return Counter.builder("reports.generated.total")
                .description("Total number of reports generated")
                .tag("type", "all")
                .register(registry);
    }

    @Bean
    public Timer reportGenerationTimer(MeterRegistry registry) {
        return Timer.builder("reports.generation.duration")
                .description("Time taken to generate reports")
                .tag("type", "all")
                .register(registry);
    }

    @Bean
    public Counter cacheHitCounter(MeterRegistry registry) {
        return Counter.builder("reports.cache.hits")
                .description("Cache hit count")
                .register(registry);
    }

    @Bean
    public Counter cacheMissCounter(MeterRegistry registry) {
        return Counter.builder("reports.cache.misses")
                .description("Cache miss count")
                .register(registry);
    }
}