# syntax=docker/dockerfile:1.7

########## BUILD ##########
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

# adjust the folder name if your service is named differently
COPY backend/reports-service/pom.xml backend/reports-service/pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn -q -f backend/reports-service/pom.xml -DskipTests dependency:go-offline

COPY backend/reports-service/src backend/reports-service/src
RUN --mount=type=cache,target=/root/.m2 mvn -q -f backend/reports-service/pom.xml -DskipTests package

########## RUNTIME ##########
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /workspace/backend/reports-service/target/*.jar /app/app.jar
EXPOSE 8084
ENTRYPOINT ["java","-jar","/app/app.jar"]
