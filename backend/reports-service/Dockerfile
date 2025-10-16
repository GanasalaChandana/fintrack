# syntax=docker/dockerfile:1.7

# Stage 1: Build
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copy pom.xml and download dependencies (cached layer)
COPY pom.xml ./
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /workspace/target/*.jar app.jar

# Expose port
EXPOSE 8084

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8084/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]