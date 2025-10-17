@echo off
REM SPARK Prompt Library Startup Script for Windows
REM Double-click this file to start everything

echo.
echo ========================================
echo   SPARK Prompt Library
echo ========================================
echo.
echo Starting:
echo   - API Server (2,376 prompts)
echo   - Browse Library
echo   - Admin Dashboard
echo.
echo Press Ctrl+C to stop
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo.
    echo Please start Docker Desktop first, then run this script again.
    pause
    exit /b 1
)

REM Start the application
docker-compose up

echo.
echo SPARK Prompt Library stopped
pause
