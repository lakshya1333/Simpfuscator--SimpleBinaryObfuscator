# Docker Setup Guide for Simpfuscator

Using Docker is the easiest way to run Simpfuscator on Windows without WSL!

## Prerequisites

- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
- Git Bash or PowerShell

## Quick Start

### 1. Install Docker Desktop

1. Download from: https://www.docker.com/products/docker-desktop/
2. Install and restart your computer
3. Launch Docker Desktop
4. Wait for it to start (whale icon in system tray)

### 2. Start the Application

Open terminal in the project directory:

```bash
# Build and start both frontend and backend
docker-compose up --build
```

That's it! The application will:
- ✅ Build Ubuntu-based backend container
- ✅ Install all dependencies automatically
- ✅ Start backend on port 5000
- ✅ Start frontend on port 5173

### 3. Access the Application

Open your browser: **http://localhost:5173**

## Docker Commands

### Start Services
```bash
docker-compose up
```

### Start in Background
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Rebuild After Changes
```bash
docker-compose up --build
```

### Stop and Remove Everything
```bash
docker-compose down -v
```

## How It Works

### Backend Container (Ubuntu)
- **Base Image**: `ubuntu:22.04`
- **Installed**: Node.js 18, Python 3, GCC, build-essential
- **Port**: 5000
- **Volume**: Mounted to `./backend` (live code reloading)

### Frontend Container (Alpine)
- **Base Image**: `node:18-alpine`
- **Port**: 5173
- **Volume**: Mounted to project root
- **Connects to**: Backend at `http://backend:5000`

## File Structure

```
simpfuscator-ui-dash/
├── docker-compose.yml       # Orchestrates both containers
├── backend/
│   ├── Dockerfile          # Backend Ubuntu container
│   ├── server.js
│   ├── obfuscator.py
│   └── package.json
└── frontend files...
```

## Advantages Over WSL

✅ **Easier Setup**: Just install Docker Desktop  
✅ **Isolated Environment**: No system pollution  
✅ **Reproducible**: Same environment everywhere  
✅ **Easy Cleanup**: Remove containers when done  
✅ **No Linux Knowledge Needed**: Just `docker-compose up`  

## Troubleshooting

### "Docker daemon not running"
- Start Docker Desktop from Start Menu
- Wait for whale icon to appear in system tray

### "Port 5000 already in use"
```bash
# Find and kill the process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "Cannot connect to backend"
- Make sure Docker Desktop is running
- Check containers: `docker-compose ps`
- Check logs: `docker-compose logs backend`

### Frontend can't reach backend
- Frontend should use `http://localhost:5000`, not `http://backend:5000`
- The proxy in `vite.config.ts` handles this

### Changes not reflecting
```bash
# Rebuild containers
docker-compose up --build
```

### Permission errors
- Docker Desktop needs to be running with proper permissions
- Try running terminal as Administrator

## Development Workflow

1. **Start containers**: `docker-compose up`
2. **Edit code**: Files are mounted, changes auto-reload
3. **View logs**: `docker-compose logs -f`
4. **Stop**: Press `Ctrl+C` or `docker-compose down`

## Production Deployment

For production, you can deploy the Docker containers to:
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Any Docker hosting service

## Comparing Options

| Feature | Native Windows | WSL | Docker |
|---------|---------------|-----|--------|
| Setup Time | ❌ Won't work | 30+ min | 10 min |
| Linux Environment | ❌ No | ✅ Yes | ✅ Yes |
| Isolated | ❌ No | ⚠️ Partial | ✅ Yes |
| Easy Cleanup | N/A | ⚠️ Complex | ✅ Simple |
| Learning Curve | N/A | Medium | Low |
| Production-Ready | N/A | No | ✅ Yes |

## Quick Commands Reference

```bash
# Start everything
docker-compose up

# Start in background
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose up --build

# Shell into backend container
docker-compose exec backend bash

# Shell into frontend container
docker-compose exec frontend sh
```

## Environment Variables

Create `backend/.env` if needed:

```env
PORT=5000
NODE_ENV=development
```

Docker Compose will automatically load it.

## Next Steps

Once containers are running:
1. Open http://localhost:5173
2. Upload an ELF binary
3. Select XOR or RSA encryption
4. Download obfuscated binary

The backend will compile ELF binaries inside the Ubuntu container! 🎉
