# Backend Integration Guide

## Overview
This document describes how to integrate your Python obfuscator backend with this React dashboard.

## Flow
1. **Select Encryption Type** - User selects one of 5 encryption types (XOR, RSA, AES, RC4, DES)
2. **Upload File** - User uploads .exe or .dll file (only after selecting encryption type)
3. **Obfuscate** - Frontend calls `/api/obfuscate` endpoint with the file and encryption type
4. **Download** - User downloads the obfuscated file
5. **Display Debug Info** - Shows encryption key, sections encrypted, processing time, etc.

## Backend Setup

A complete Express.js backend has been created in the `backend/` folder.

### Setup Instructions:

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

The server will run on `http://localhost:5000`

## Backend API Endpoint

### POST `/api/obfuscate`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: 
  - `file`: File upload (binary)
  - `encryptionType`: One of: `xor`, `rsa`, `aes`, `rc4`, `des`

**Example with cURL:**
```bash
curl -X POST http://localhost:5000/api/obfuscate \
  -F "file=@/path/to/file.exe" \
  -F "encryptionType=aes"
```

**Legacy Example with Python Flask (if you prefer Flask):**

```python
from flask import Flask, request, jsonify, send_file
import subprocess
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'

@app.route('/api/obfuscate', methods=['POST'])
def obfuscate_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    
    # Save uploaded file
    input_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(input_path)
    
    # Run obfuscator
    output_path = os.path.join(OUTPUT_FOLDER, f'obfuscated_{file.filename}')
    result = subprocess.run(
        ['python3', 'obfuscator.py', input_path, '-o', output_path],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        return jsonify({'error': 'Obfuscation failed', 'details': result.stderr}), 500
    
    # Return response with file URL and metadata
    return jsonify({
        'fileUrl': f'/download/{os.path.basename(output_path)}',
        'downloadUrl': f'/download/{os.path.basename(output_path)}',
        'encryptionKey': 'ABC123XYZ789',  # Replace with actual key from obfuscator
        'sectionsEncrypted': 5,  # Replace with actual count
        'processingTime': '2.3s',  # Replace with actual time
        # Add more debug info as needed
    })

@app.route('/download/<filename>')
def download_file(filename):
    return send_file(os.path.join(OUTPUT_FOLDER, filename), as_attachment=True)

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    app.run(debug=True)
```

**Response Format:**
```json
{
  "success": true,
  "message": "Obfuscation completed successfully",
  "fileUrl": "/api/download/obfuscated_file.exe",
  "downloadUrl": "/api/download/obfuscated_file.exe",
  "encryptionType": "aes",
  "encryptionKey": "AES_KEY_ABC123XYZ789",
  "sectionsEncrypted": 7,
  "processingTime": "2.34s",
  "keySize": "256-bit",
  "rounds": 10,
  "originalFile": "file.exe",
  "obfuscatedFile": "obfuscated_file.exe"
}
```

## Python Obfuscator Script

The backend includes a placeholder `obfuscator.py` script that you should replace with your actual implementation.

**Current command executed by backend:**
```bash
python3 obfuscator.py <input_file> -t <encryption_type> -o <output_file>
```

**Example:**
```bash
python3 obfuscator.py uploads/file.exe -t aes -o output/obfuscated_file.exe
```

## Adding More Debug Info

To add more debug information cards, edit `src/pages/Dashboard.tsx` in the "Obfuscation Details" section:

```tsx
{/* Add more cards here for additional debug info */}
<Card className="glass-card">
  <CardHeader>
    <CardTitle className="text-sm text-muted-foreground">Your Debug Info</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-lg font-semibold">
      {obfuscationData.yourField || "N/A"}
    </p>
  </CardContent>
</Card>
```

## Development Setup

The `vite.config.ts` has been configured with a proxy that forwards all `/api/*` requests to `http://localhost:5000`.

### Running the Full Stack:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

Then open `http://localhost:8080` in your browser.

## Encryption Options

The dashboard provides 5 encryption types:

1. **XOR Encryption** - Fast bitwise operation encryption
2. **RSA Encryption** - Public-key cryptography algorithm
3. **AES Encryption** - Advanced Encryption Standard (256-bit)
4. **RC4 Encryption** - Stream cipher encryption
5. **DES Encryption** - Data Encryption Standard

Users must select an encryption type before they can upload files.

## File Structure

```
simpfuscator-ui-dash/
├── backend/
│   ├── server.js           # Express server with API endpoints
│   ├── obfuscator.py       # Python obfuscator (replace with yours)
│   ├── package.json
│   ├── uploads/            # Temporary file uploads (auto-created)
│   ├── output/             # Obfuscated files (auto-created)
│   └── README.md
├── src/
│   └── pages/
│       └── Dashboard.tsx   # Updated with encryption selection
└── vite.config.ts          # Configured with API proxy
```
