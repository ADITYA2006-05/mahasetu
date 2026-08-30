# Multi-stage Docker build for MahaSetu Java 21 Backend
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy Maven wrapper and POM from backend directory
COPY backend/pom.xml backend/mvnw ./
COPY backend/.mvn ./.mvn

RUN chmod +x ./mvnw

# Copy source code and build jar
COPY backend/src ./src
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

COPY --from=build /app/target/mahasetu-interop-backend-*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
