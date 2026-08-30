#!/bin/bash
set -e

cd "$(dirname "$0")"

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