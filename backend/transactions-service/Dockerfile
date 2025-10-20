# syntax=docker/dockerfile:1.7

########## BUILD ##########
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

# Context is backend/transactions-service, so use local paths:
COPY pom.xml ./pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn -q -B dependency:go-offline

COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -q -B -DskipTests package

########## RUNTIME ##########
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /workspace/target/*.jar /app/app.jar
EXPOSE 8082
ENTRYPOINT ["java","-jar","/app/app.jar"]
