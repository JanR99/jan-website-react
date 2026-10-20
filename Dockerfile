# Build stage: build the backend module together with its parent POM, with the same Java as at runtime
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
COPY backend/pom.xml backend/pom.xml
RUN mvn -B -pl backend -am dependency:go-offline
COPY backend/src backend/src
RUN mvn -B -pl backend -am package -DskipTests

# Runtime stage: small image with only the JRE and the built JAR
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/backend/target/*.jar app.jar
# not as root
RUN useradd --system --no-create-home --shell /usr/sbin/nologin app
USER app
EXPOSE 8080
# without a limit Java uses only a quarter of the container's memory for the heap
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
