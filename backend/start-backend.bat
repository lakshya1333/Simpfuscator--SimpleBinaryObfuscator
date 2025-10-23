@echo off
setlocal

echo ====================================
echo   Simpfuscator Backend Startup
echo ====================================
echo.

REM Check if we're in the backend directory
if not exist "server.js" (
    echo Navigating to backend directory...
    cd backend 2>nul || (
        echo Error: Cannot find backend directory
        echo Please run this script from the project root
        pause
        exit /b 1
    )
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

REM Check if Python is available
where python >nul 2>nul
if errorlevel 1 (
    where python3 >nul 2>nul
    if errorlevel 1 (
        echo Warning: Python not found in PATH
        echo The obfuscator.py script requires Python 3
        echo.
    )
)

REM Create uploads and output directories if they don't exist
if not exist "uploads" mkdir uploads
if not exist "output" mkdir output

echo Starting backend server on port 5000...
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
call npm run dev
