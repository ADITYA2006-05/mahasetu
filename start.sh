#!/bin/bash
set -e

cd "$(dirname "$0")"

# Set JAVA_HOME for Maven
export JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"

# Build the backend (Spring Boot) using Maven wrapper
cd backend
chmod +x ./mvnw
./mvnw clean package -DskipTests

# Start the backend (Spring Boot)
java -jar target/mahasetu-interop-backend-*.jar &
BACKEND_PID=$!

# Start the frontend (Vite)
cd ../frontend
npm run dev &

# Wait for background processes
wait $BACKEND_PID