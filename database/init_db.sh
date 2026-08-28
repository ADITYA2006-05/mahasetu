#!/usr/bin/env bash
# =====================================================================
# MahaSetu Database Initialization Script (Linux/macOS)
# =====================================================================

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-mahasetu_db}"
DB_USER="${DB_USER:-postgres}"

echo "==================================================="
echo "Initializing MahaSetu PostgreSQL Database..."
echo "Host: ${DB_HOST}:${DB_PORT}"
echo "Database: ${DB_NAME}"
echo "User: ${DB_USER}"
echo "==================================================="

# Create database if it does not exist
psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1 || psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -c "CREATE DATABASE ${DB_NAME};"

echo "Executing 01_schema.sql..."
psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f 01_schema.sql

echo "Executing 02_seed_data.sql..."
psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f 02_seed_data.sql

echo "MahaSetu Database Initialization Completed Successfully!"
