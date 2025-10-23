#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}  Simpfuscator Backend Startup${NC}"
echo -e "${GREEN}====================================${NC}\n"

# Check if we're in the backend directory
if [ ! -f "server.js" ]; then
    echo -e "${YELLOW}Navigating to backend directory...${NC}"
    cd backend 2>/dev/null || {
        echo -e "${RED}Error: Cannot find backend directory${NC}"
        echo -e "${YELLOW}Please run this script from the project root${NC}"
        exit 1
    }
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}Dependencies installed successfully!${NC}\n"
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Warning: python3 not found in PATH${NC}"
    echo -e "${YELLOW}The obfuscator.py script requires Python 3${NC}\n"
fi

# Create uploads and output directories if they don't exist
mkdir -p uploads output

echo -e "${GREEN}Starting backend server on port 5000...${NC}\n"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}\n"

# Start the server
npm run dev
