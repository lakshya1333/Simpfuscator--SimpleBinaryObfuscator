@echo off
echo ========================================
echo   Simpfuscator - Starting with Docker
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo.
    echo Please start Docker Desktop first:
    echo 1. Open Docker Desktop from Start Menu
    echo 2. Wait for the whale icon to appear in system tray
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo [✓] Docker is running
echo.
echo Starting containers...
echo.

docker-compose up --build

pause
