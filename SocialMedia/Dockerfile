# ===================================================================
# Multi-stage Dockerfile for Deshi Commerce Spring Boot Backend
# ===================================================================

# Stage 1: Build the JAR with Maven
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /build

# Copy Maven wrapper & POM to leverage Docker caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code and build production package
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Minimal Production JRE Image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Add unprivileged user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create persistent uploads directory
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

# Copy executable jar from builder stage
COPY --from=builder /build/target/*.jar app.jar
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
