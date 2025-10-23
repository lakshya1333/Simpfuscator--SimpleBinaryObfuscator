# 🚀 Quick Fix for "Failed to Fetch" Error

## The Issue
The backend server is not running or dependencies are not installed.

## ✅ Quick Fix (3 Steps)

### Step 1: Install Backend Dependencies
Open a terminal and run:
```bash
cd backend
npm install
```

Wait for installation to complete (you'll see a dependency tree).

### Step 2: Start Backend Server
In the same terminal:
```bash
npm run dev
```

You should see:
```
🚀 Simpfuscator Backend Server running on port 5000
📁 Upload directory: ...
📁 Output directory: ...
🔗 Health check: http://localhost:5000/api/health
```

### Step 3: Keep Frontend Running
In a **NEW terminal** (keep backend running in the first one):
```bash
npm run dev
```

## ✅ Verify It's Working

1. **Check Backend Health:**
   Open browser: `http://localhost:5000/api/health`
   
   Should show:
   ```json
   {"status":"OK","timestamp":"...","uptime":...}
   ```

2. **Check Frontend:**
   Open browser: `http://localhost:8080`

3. **Test Upload:**
   - Select an encryption type (XOR, RSA, AES, RC4, or DES)
   - Upload a .exe or .dll file
   - Click "Obfuscate File"

## 📝 Summary

You need **2 terminals running simultaneously:**

**Terminal 1 (Backend):**
```
cd backend
npm install
npm run dev
# Keep this running!
```

**Terminal 2 (Frontend):**
```
npm run dev
# Keep this running too!
```

## 🐛 Still Getting Errors?

### Error: "Cannot find module 'express'"
```bash
cd backend
npm install
```

### Error: "Port 5000 already in use"
Kill the existing process or change port in `backend/.env`:
```
PORT=5001
```

Then update `vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:5001',
```

### Error: "python3: command not found"
Edit `backend/server.js` line 62, change `python3` to `python`:
```javascript
const pythonProcess = spawn('python', [  // was: 'python3'
```

## 📚 Need More Help?
See `TROUBLESHOOTING.md` for detailed debugging steps.
