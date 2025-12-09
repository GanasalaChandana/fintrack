FROM maven:3.9.10-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -q -B -DskipTests dependency:go-offline
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -q -B -DskipTests clean package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

COPY --from=build /workspace/target/*.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8083/actuator/health || exit 1

EXPOSE 8083
ENTRYPOINT ["java","-jar","/app/app.jar"]