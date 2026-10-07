# Build stage: build the backend module together with its parent POM
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
RUN mvn -B -pl backend -am package -DskipTests

# Runtime stage: small image with only the JRE and the built JAR
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]