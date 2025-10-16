# FinTrack Starter (Final)

Clean Spring Boot 3.3.3 setup, aligned with Spring Cloud 2024.0.2 for the API Gateway.
Java 17+, Maven 3.9+ required.

## Modules
- infra/docker-compose.yml (Postgres, Redis, Kafka, Kafdrop)
- backend/api-gateway (Spring Cloud Gateway + WebFlux)
- backend/users-service (Spring Boot Web/JPA/Actuator/Security)
- backend/transactions-service (Spring Boot Web/JPA/Actuator + spring-kafka)
- ml/classifier (FastAPI stub)
- frontend/web (minimal Next.js scaffold)

## Ports
Gateway 8080, Users 8081, Transactions 8082, Classifier 8001, Postgres 5432, Redis 6379, Kafka 9092, Kafdrop 19000.

## Quick start
1) `cd infra && docker compose up -d`
2) In 3 terminals:
   - `cd backend/users-service && mvn spring-boot:run`
   - `cd backend/transactions-service && mvn spring-boot:run`
   - `cd backend/api-gateway && mvn spring-boot:run`
3) Test: open /actuator/health on each port.
