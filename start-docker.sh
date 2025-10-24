#!/bin/bash
echo "========================================"
echo "  Simpfuscator - Starting with Docker"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo ""
    echo "Please start Docker first:"
    echo "1. Open Docker Desktop"
    echo "2. Wait for it to start"
    echo "3. Run this script again"
    echo ""
    exit 1
fi

echo "[✓] Docker is running"
echo ""
echo "Starting containers..."
echo ""

docker-compose up --build
