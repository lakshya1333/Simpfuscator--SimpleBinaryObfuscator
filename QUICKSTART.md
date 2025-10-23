# Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.x
- npm or bun

### Installation & Running

#### 1. Install Frontend Dependencies
```bash
npm install
# or
bun install
```

#### 2. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

#### 3. Start Backend Server (Terminal 1)
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

#### 4. Start Frontend Dev Server (Terminal 2)
```bash
npm run dev
```
Frontend will run on `http://localhost:8080`

#### 5. Open Browser
Navigate to `http://localhost:8080`

---

## 🔧 How It Works

### User Flow:
1. **Select Encryption Type**
   - User chooses one of 5 options: XOR, RSA, AES, RC4, or DES
   
2. **Upload File** (appears only after encryption type is selected)
   - Drag & drop or browse for .exe or .dll files (max 100MB)
   
3. **Obfuscate**
   - Click "Obfuscate File" button
   - Backend runs: `python3 obfuscator.py <file> -t <type> -o <output>`
   
4. **Download**
   - Download button appears after completion
   
5. **View Details**
   - See encryption key, sections encrypted, processing time, etc.

---

## 📝 Customizing Your Obfuscator

### Replace the Python Script

Edit `backend/obfuscator.py` with your actual obfuscation logic.

**Required interface:**
```python
# Accept these arguments:
# python3 obfuscator.py <input_file> -t <encryption_type> -o <output_file>

# Example:
# python3 obfuscator.py uploads/file.exe -t aes -o output/obfuscated_file.exe
```

**Optional: Output JSON for debug info**
```python
import json

debug_info = {
    "encryptionKey": "YOUR_KEY_HERE",
    "sectionsEncrypted": 7,
    "keySize": "256-bit",
    "rounds": 10
}

print(json.dumps(debug_info))  # Backend will parse this
```

---

## 🎨 Adding More Debug Info Cards

Edit `src/pages/Dashboard.tsx` and add more cards in the "Obfuscation Details" section:

```tsx
<Card className="glass-card">
  <CardHeader>
    <CardTitle className="text-sm text-muted-foreground">
      Your Custom Field
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-lg font-semibold">
      {obfuscationData.yourCustomField || "N/A"}
    </p>
  </CardContent>
</Card>
```

---

## 🔒 Encryption Types Available

| Type | Description | Use Case |
|------|-------------|----------|
| XOR  | Fast bitwise operation | Quick obfuscation |
| RSA  | Public-key cryptography | Strong asymmetric encryption |
| AES  | Advanced Encryption Standard | Industry standard (256-bit) |
| RC4  | Stream cipher | Legacy compatibility |
| DES  | Data Encryption Standard | Basic encryption |

---

## 📁 Project Structure

```
simpfuscator-ui-dash/
├── backend/                 # Express.js backend
│   ├── server.js           # Main API server
│   ├── obfuscator.py       # Python obfuscator script
│   ├── uploads/            # Temp uploads (auto-created)
│   └── output/             # Obfuscated files (auto-created)
├── src/
│   ├── pages/
│   │   └── Dashboard.tsx   # Main dashboard with encryption options
│   └── components/
│       └── UploadSection.tsx
└── vite.config.ts          # Frontend config with API proxy
```

---

## 🐛 Troubleshooting

### Backend not starting?
- Check if Python 3 is installed: `python3 --version`
- Check if port 5000 is available
- Check backend logs for errors

### Frontend can't connect to backend?
- Make sure backend is running on port 5000
- Check browser console for CORS errors
- Verify vite.config.ts proxy settings

### File upload fails?
- Check file size (max 100MB)
- Verify file extension (.exe or .dll)
- Check backend uploads/ directory permissions

---

## 📚 API Documentation

See `BACKEND_INTEGRATION.md` for complete API documentation.

### Main Endpoint:
**POST** `/api/obfuscate`
- Body: multipart/form-data
  - `file`: Binary file
  - `encryptionType`: xor | rsa | aes | rc4 | des

**GET** `/api/download/:filename`
- Downloads obfuscated file

**GET** `/api/health`
- Health check endpoint
