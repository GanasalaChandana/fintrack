package com.fintrack.transactions.config;

import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class HibernateConfig {
    
    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer() {
        return (Map<String, Object> hibernateProperties) -> {
            hibernateProperties.put("hibernate.default_schema", "public");
            hibernateProperties.put("hibernate.default_catalog", "");
        };
    }
}