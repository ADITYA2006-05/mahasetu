#!/bin/bash
set -e

cd "$(dirname "$0")"

# Start the backend (Spring Boot)
java -jar backend/target/mahasetu-interop-backend-*.jar &
BACKEND_PID=$!

# Start the frontend (Vite)
cd frontend
npm run dev &

# Wait for background processes
wait $BACKEND_PID