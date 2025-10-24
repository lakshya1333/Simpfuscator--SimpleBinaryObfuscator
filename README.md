# Simpfuscator - Simple Binary Obfuscator

A modern web-based tool for obfuscating ELF binaries with encryption and digital signatures.

## 🎯 Features

- **ELF Binary Support**: Works exclusively with ELF (Executable and Linkable Format) files
- **Multiple Encryption Types**: 
  - XOR encryption (fast, lightweight)
  - RSA encryption (demonstration with small primes)
- **Digital Signatures**: RSA-PSS (2048-bit) signature verification for file integrity
- **Modern UI**: Dark-themed dashboard built with React, TypeScript, and Tailwind CSS
- **Real-time Progress**: Live obfuscation progress with detailed debug information
- **Secure Upload**: File validation and signature verification before processing

## 🚀 Quick Start

### Prerequisites

**Choose one Linux environment:**

#### Option 1: Docker (Recommended for Windows) 🐳
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- See [DOCKER_SETUP.md](DOCKER_SETUP.md) for complete guide

#### Option 2: Native Linux or WSL
- Node.js (v16 or higher)
- Python 3.x
- GCC compiler
- pip (Python package manager)
- See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for WSL guide

> ⚠️ **Important**: The obfuscation process generates ELF binaries and requires a Linux environment. On Windows, use Docker or WSL.

---

## 🐳 Quick Start with Docker (Easiest!)

### 1. Install Docker Desktop
Download from: https://www.docker.com/products/docker-desktop/

### 2. Start Application
```bash
docker-compose up --build
```

### 3. Open Browser
```
http://localhost:5173
```

**That's it!** Both frontend and backend will run in containers. See [DOCKER_SETUP.md](DOCKER_SETUP.md) for details.

---

## 💻 Manual Installation (Linux/WSL)

1. **Clone the repository**
```bash
git clone https://github.com/lakshya1333/Simpfuscator--SimpleBinaryObfuscator.git
cd simpfuscator-ui-dash
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
pip install -r requirements.txt
```

4. **Start the application**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:5173
```

## 🪟 Running on Windows (WSL)

Since the obfuscation process requires Linux, you need to use WSL:

### 1. Install WSL
```bash
# In PowerShell (as Administrator)
wsl --install
```

### 2. Open WSL Terminal
```bash
# Start your default WSL distribution
wsl
```

### 3. Install Prerequisites in WSL
```bash
# Update packages
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python and GCC
sudo apt install -y python3 python3-pip gcc

# Install build essentials
sudo apt install -y build-essential
```

### 4. Navigate to Project (inside WSL)
```bash
# Access Windows files from WSL
cd /mnt/d/IS-Project/simpfuscator-ui-dash
```

### 5. Run the Application
```bash
# Terminal 1: Backend (in WSL)
cd backend
npm install
pip3 install -r requirements.txt
npm run dev

# Terminal 2: Frontend (can run in Windows or WSL)
npm install
npm run dev
```

The frontend can run on Windows, but the backend MUST run in WSL for obfuscation to work.

## 📁 Project Structure

```
simpfuscator-ui-dash/
├── src/                      # Frontend source code
│   ├── pages/               # React pages
│   │   └── Dashboard.tsx    # Main dashboard
│   ├── components/          # React components
│   │   ├── UploadSection.tsx
│   │   └── ui/             # Shadcn UI components
│   └── utils/
│       └── digitalSignature.ts  # RSA signature utilities
├── backend/                 # Backend server
│   ├── server.js           # Express API server
│   ├── obfuscator.py       # Python obfuscation script
│   ├── encryptor.py        # Encryption algorithms
│   ├── requirements.txt    # Python dependencies
│   ├── uploads/            # Temporary file storage
│   └── output/             # Obfuscated binaries
└── README.md
```

## 🔒 Security Features

### Digital Signatures
- **Algorithm**: RSA-PSS (Probabilistic Signature Scheme)
- **Key Size**: 2048 bits
- **Hash Function**: SHA-256
- **Salt Length**: 32 bytes
- **Storage**: Browser localStorage

Every file upload is:
1. Signed with RSA private key on the client
2. Verified with public key on the server
3. Rejected if signature is invalid

### File Validation
- ELF magic number validation (0x7F454C46)
- File size limit: 100MB
- Accepted formats: `.elf`, `.bin`, `.out`, `.so`, or no extension

## 🛠️ How It Works

### Obfuscation Process

1. **Upload**: User uploads an ELF binary
2. **Sign**: File is signed with RSA-PSS digital signature
3. **Verify**: Server validates ELF format and signature
4. **Encrypt**: Binary is encrypted using selected algorithm
5. **Compile**: Creates self-extracting loader in C
6. **Download**: User receives obfuscated executable

### Encryption Types

#### XOR Encryption
- Fast bitwise operation
- Random key (1-255)
- Suitable for simple obfuscation

#### RSA Encryption  
- Byte-by-byte RSA encryption
- Small prime demonstration (4-bit)
- Educational purposes

### Loader Mechanism

The obfuscated binary includes a C loader that:
- Contains encrypted binary as embedded data
- Decrypts at runtime using matching algorithm
- Writes to `/tmp` with random filename
- Executes the decrypted binary
- Cleans up temporary files

## 📡 API Reference

### POST `/api/obfuscate`

Obfuscate an ELF binary file.

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `file`: ELF binary file
  - `encryptionType`: `"xor"` or `"rsa"`
  - `signature`: Base64 digital signature
  - `publicKey`: JWK public key (JSON string)

**Response:**
```json
{
  "success": true,
  "fileUrl": "/api/download/obfuscated_binary",
  "encryptionType": "XOR",
  "encryptionKey": "Key: 123",
  "processingTime": "2.34s",
  "originalSize": 12345,
  "encryptedSize": 12345,
  "signatureVerified": true
}
```

### GET `/api/download/:filename`

Download obfuscated binary.

## 🧪 Testing

1. Create a simple test ELF binary:
```bash
echo 'int main() { return 0; }' > test.c
gcc test.c -o test.elf
```

2. Upload `test.elf` through the web interface
3. Select encryption type (XOR or RSA)
4. Click "Start Obfuscation"
5. Download the obfuscated binary

## 📚 Documentation

- [Backend Integration Guide](BACKEND_INTEGRATION.md)
- [Digital Signature Details](DIGITAL_SIGNATURE.md)
- [Quick Start Guide](QUICKSTART.md)
- [Troubleshooting](TROUBLESHOOTING.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Repository

https://github.com/lakshya1333/Simpfuscator--SimpleBinaryObfuscator

## ⚠️ Disclaimer

This tool is for educational purposes. The RSA implementation uses small primes for demonstration and should not be used for production security purposes.
