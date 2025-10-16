package com.fintrack.reports_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableScheduling
public class ReportsServiceApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(ReportsServiceApplication.class, args);
    }
}
