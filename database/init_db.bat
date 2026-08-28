@echo off
REM =====================================================================
REM MahaSetu Database Initialization Script (Windows)
REM =====================================================================

set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=mahasetu_db
set DB_USER=postgres

echo ===================================================
echo Initializing MahaSetu PostgreSQL Database...
echo Host: %DB_HOST%:%DB_PORT%
echo Database: %DB_NAME%
echo User: %DB_USER%
echo ===================================================

echo Creating database if not exists...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -tc "SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%'" | findstr 1 || psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;"

echo Running 01_schema.sql...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f 01_schema.sql

echo Running 02_seed_data.sql...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f 02_seed_data.sql

echo MahaSetu Database Initialization Complete!
pause
