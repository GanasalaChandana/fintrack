package com.fintrack.gateway.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "FinTrack API Gateway",
        version = "1.0.0",
        description = "API Gateway for all FinTrack microservices — routes, circuit breakers, and JWT auth",
        contact = @Contact(name = "FinTrack Team")
    ),
    servers = {
        @Server(url = "http://localhost:8080", description = "Local Gateway")
    }
)
public class OpenApiConfig {}
