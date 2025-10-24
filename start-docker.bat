@echo off
cls
echo ============================================================
echo   Simpfuscator - Docker Setup
echo ============================================================
echo.

REM Check if Docker is running
echo [*] Checking Docker status...
docker info >nul 2>&1
if errorlevel 1 (
    echo.
    echo [X] ERROR: Docker Desktop is NOT running!
    echo.
    echo ============================================================
    echo   PLEASE START DOCKER DESKTOP FIRST
    echo ============================================================
    echo.
    echo Steps to start Docker Desktop:
    echo.
    echo 1. Press Windows key and search for "Docker Desktop"
    echo 2. Click to open Docker Desktop
    echo 3. Wait 30-60 seconds for it to fully start
    echo 4. Look for the whale icon in your system tray ^(bottom right^)
    echo 5. When the whale icon stops animating, Docker is ready
    echo 6. Run this script again
    echo.
    echo If you don't have Docker Desktop installed:
    echo Download from: https://www.docker.com/products/docker-desktop/
    echo.
    echo ============================================================
    pause
    exit /b 1
)

echo [✓] Docker Desktop is running!
echo.
echo [*] Starting containers...
echo     - Backend: Ubuntu container with Python, GCC, Node.js
echo     - Frontend: Node.js container
echo.
echo This may take a few minutes on first run...
echo.

docker-compose up --build

echo.
echo ============================================================
echo Containers stopped. Press any key to exit...
pause >nul
