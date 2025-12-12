FROM maven:3.9.10-eclipse-temurin-21 AS build
WORKDIR /workspace

# Copy pom.xml and download dependencies (separate layer for better caching)
COPY pom.xml .
RUN mvn -q -B -DskipTests dependency:go-offline

# Copy source code and build
COPY src ./src
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy the built JAR
COPY --from=build /workspace/target/*.jar app.jar

# Expose port (Render will override this with PORT env variable)
EXPOSE 8085

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8085/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]