# Simpfuscator - Troubleshooting Guide

## "Failed to fetch" Error

If you're getting a "Failed to fetch" error, follow these steps:

### Step 1: Start the Backend Server

**Windows:**
```bash
cd backend
npm install
npm run dev
```

**Or use the startup script:**
```bash
./backend/start-backend.bat
```

**Linux/Mac:**
```bash
cd backend
npm install
npm run dev
```

**Or use the startup script:**
```bash
chmod +x backend/start-backend.sh
./backend/start-backend.sh
```

### Step 2: Verify Backend is Running

Open a browser and go to: `http://localhost:5000/api/health`

You should see:
```json
{
  "status": "OK",
  "timestamp": "...",
  "uptime": 123
}
```

### Step 3: Check the Console

**Backend Console:**
- Should show: `🚀 Simpfuscator Backend Server running on port 5000`
- Check for any error messages

**Frontend Console (Browser DevTools):**
- Open DevTools (F12)
- Look for network errors in the Console tab
- Check the Network tab for failed requests

### Common Issues

#### 1. Backend Not Running
**Error:** `Cannot connect to backend server`

**Solution:**
```bash
cd backend
npm run dev
```

#### 2. Port 5000 Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
- Kill the process using port 5000
- Or change the port in `backend/.env`:
  ```
  PORT=5001
  ```
- And update `vite.config.ts` proxy:
  ```typescript
  proxy: {
    '/api': {
      target: 'http://localhost:5001',
      changeOrigin: true,
    }
  }
  ```

#### 3. CORS Error
**Error:** `Access to fetch at '...' has been blocked by CORS policy`

**Solution:**
The backend already has CORS enabled. Make sure:
- Backend is running
- You're accessing frontend via `http://localhost:8080` (not a different port)

#### 4. Python Not Found
**Error:** `Failed to start Python process` or `python3: command not found`

**Solution:**
- Install Python 3: https://www.python.org/downloads/
- Or update `backend/server.js` line 62 to use `python` instead of `python3`:
  ```javascript
  const pythonProcess = spawn('python', [  // changed from 'python3'
  ```

#### 5. File Upload Fails
**Error:** `No file uploaded` or `Only .exe and .dll files are allowed`

**Solution:**
- Check file extension (must be .exe or .dll)
- Check file size (must be under 100MB)
- Make sure an encryption type is selected

### Full Startup Process

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

Wait until you see: `🚀 Simpfuscator Backend Server running on port 5000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Terminal 3 - Test Backend:**
```bash
curl http://localhost:5000/api/health
```

### Still Having Issues?

1. **Check Backend Logs**
   - Look at the terminal where backend is running
   - Check for error messages

2. **Check Frontend Console**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for red error messages

3. **Check Network Tab**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Click on failed request
   - Check the error details

4. **Verify File Paths**
   - Backend should have `uploads/` and `output/` directories
   - These are created automatically on startup

5. **Check Python**
   ```bash
   python3 --version
   # or
   python --version
   ```

6. **Test API Manually**
   ```bash
   curl -X POST http://localhost:5000/api/obfuscate \
     -F "file=@test.exe" \
     -F "encryptionType=xor"
   ```

### Debug Mode

To enable more detailed logging, edit `backend/server.js` and add:
```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

After the `app.use(cors());` line.
