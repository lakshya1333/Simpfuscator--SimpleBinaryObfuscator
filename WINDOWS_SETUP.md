# Windows Setup Guide

## ⚠️ Important Notice

**Simpfuscator requires a Linux environment** because it:
- Generates ELF binaries (Linux executable format)
- Uses Linux-specific system calls (`fork`, `execv`, etc.)
- Requires GCC with Linux headers (`sys/wait.h`, etc.)

## Solution: Use WSL (Windows Subsystem for Linux)

WSL allows you to run a Linux environment directly on Windows without a VM.

---

## Step 1: Install WSL

### Option A: Automatic Installation (Recommended)

Open **PowerShell as Administrator** and run:

```powershell
wsl --install
```

This installs:
- WSL 2
- Ubuntu (default distribution)
- Required components

**Restart your computer** after installation.

### Option B: Manual Installation

If automatic install fails:

1. Open PowerShell as Administrator
2. Run these commands:

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

3. Restart computer
4. Download and install: [WSL2 Linux kernel update](https://aka.ms/wsl2kernel)
5. Set WSL 2 as default:

```powershell
wsl --set-default-version 2
```

6. Install Ubuntu from Microsoft Store

---

## Step 2: Setup Ubuntu in WSL

1. **Launch Ubuntu** from Start Menu
2. **Create username and password** when prompted
3. **Update packages:**

```bash
sudo apt update && sudo apt upgrade -y
```

---

## Step 3: Install Prerequisites

Run these commands in Ubuntu (WSL):

### Install Node.js 18.x

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install Python and Development Tools

```bash
sudo apt install -y python3 python3-pip gcc build-essential
```

### Verify Installations

```bash
node --version    # Should show v18.x or higher
python3 --version # Should show Python 3.x
gcc --version     # Should show gcc version
```

---

## Step 4: Access Your Project Files

Windows drives are mounted in WSL at `/mnt/`:

```bash
# If your project is at D:\IS-Project\simpfuscator-ui-dash
cd /mnt/d/IS-Project/simpfuscator-ui-dash
```

---

## Step 5: Install Project Dependencies

### Backend (in WSL Ubuntu)

```bash
cd /mnt/d/IS-Project/simpfuscator-ui-dash/backend
npm install
pip3 install -r requirements.txt
```

### Frontend (can be in Windows OR WSL)

**Option A: Run in Windows**
```bash
# In PowerShell or Git Bash
cd D:\IS-Project\simpfuscator-ui-dash
npm install
```

**Option B: Run in WSL**
```bash
cd /mnt/d/IS-Project/simpfuscator-ui-dash
npm install
```

---

## Step 6: Run the Application

### Start Backend (MUST be in WSL)

Open **WSL Ubuntu terminal**:

```bash
cd /mnt/d/IS-Project/simpfuscator-ui-dash/backend
npm run dev
```

You should see:
```
🚀 Simpfuscator Backend Server running on port 5000
```

### Start Frontend (Can be Windows or WSL)

Open a **new terminal** (PowerShell, Git Bash, or WSL):

```bash
cd D:\IS-Project\simpfuscator-ui-dash  # Windows
# OR
cd /mnt/d/IS-Project/simpfuscator-ui-dash  # WSL

npm run dev
```

You should see:
```
Local: http://localhost:5173
```

### Open Browser

Navigate to: `http://localhost:5173`

---

## 📋 Quick Reference

### Open WSL Terminal
- Click Start → Ubuntu
- Or run `wsl` in PowerShell

### Access Windows Files from WSL
```bash
cd /mnt/c/  # C: drive
cd /mnt/d/  # D: drive
```

### Stop Backend Server
Press `Ctrl + C` in the backend terminal

### Restart Everything
```bash
# In WSL terminal (backend)
cd /mnt/d/IS-Project/simpfuscator-ui-dash/backend
npm run dev

# In Windows/WSL terminal (frontend)
cd /mnt/d/IS-Project/simpfuscator-ui-dash
npm run dev
```

---

## 🔧 Troubleshooting

### "wsl: command not found"
- WSL is not installed. Follow Step 1.

### "Cannot connect to backend server"
- Make sure backend is running in WSL
- Check that it shows "running on port 5000"
- Frontend and backend must both be running

### "sys/wait.h: No such file or directory"
- Backend is running on Windows, not WSL
- Must run backend in WSL Ubuntu terminal

### Python module errors
```bash
# In WSL, reinstall Python packages
cd /mnt/d/IS-Project/simpfuscator-ui-dash/backend
pip3 install -r requirements.txt
```

### Port already in use
```bash
# Kill process on port 5000
sudo kill -9 $(sudo lsof -t -i:5000)

# Or use a different port in backend/.env
PORT=5001
```

---

## 🚀 Production Deployment

For production, deploy the backend to:
- Linux VPS (DigitalOcean, AWS EC2, etc.)
- Docker container
- Heroku with Linux buildpack
- Any Linux hosting service

The frontend can be deployed anywhere (Vercel, Netlify, etc.) as it's just React.

---

## ❓ FAQ

**Q: Can I run everything on native Windows?**  
A: No. The obfuscation process requires Linux to compile ELF binaries.

**Q: Do I need to install Linux separately?**  
A: No. WSL runs Linux inside Windows without dual-booting or VMs.

**Q: Can I use Docker instead of WSL?**  
A: Yes, but WSL is simpler for development.

**Q: Does this work on Windows 10?**  
A: Yes, WSL 2 works on Windows 10 version 1903 or higher.

**Q: Will my files in Windows be accessible in WSL?**  
A: Yes, at `/mnt/c/`, `/mnt/d/`, etc.

---

## ✅ Summary

1. ✅ Install WSL with Ubuntu
2. ✅ Install Node.js, Python, GCC in WSL
3. ✅ Access project files via `/mnt/d/...`
4. ✅ Run backend in WSL
5. ✅ Run frontend in Windows or WSL
6. ✅ Open http://localhost:5173

**Backend MUST run in WSL for obfuscation to work!**
