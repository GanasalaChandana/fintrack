# syntax=docker/dockerfile:1.7

########## BUILD ##########
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copy pom.xml
COPY pom.xml ./pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -B

# Copy source code

COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn package -DskipTests -B

########## RUNTIME ##########
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /workspace/target/*.jar /app/app.jar
EXPOSE 8083
ENTRYPOINT ["java","-jar","/app/app.jar"]
