# Simpfuscator Backend

Express.js backend server with Python obfuscator for the Simpfuscator tool.

## Setup

### 1. Install Node.js dependencies:
```bash
npm install
```

### 2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

Required Python packages:
- `lief` - Binary parsing and manipulation
- `pycryptodome` - Cryptographic operations

### 3. Create a `.env` file:
```bash
cp .env.example .env
```

### 4. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### POST `/api/obfuscate`
Upload and obfuscate a binary file with digital signature verification.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: ELF binary file (.elf, .bin, .out, .so, or no extension)
  - `encryptionType`: One of: `xor`, `rsa`
  - `signature`: RSA-PSS digital signature (base64)
  - `publicKey`: Public key in JWK format (JSON string)

**Response:**
```json
{
  "success": true,
  "message": "Obfuscation completed successfully",
  "fileUrl": "/api/download/obfuscated_file.exe",
  "downloadUrl": "/api/download/obfuscated_file.exe",
  "encryptionType": "XOR",
  "encryptionKey": "Key: 123",
  "sectionsEncrypted": 1,
  "processingTime": "2.34s",
  "originalFile": "file.exe",
  "obfuscatedFile": "obfuscated_file.exe",
  "originalSize": 12345,
  "encryptedSize": 12345,
  "signatureVerified": true
}
```

### GET `/api/download/:filename`
Download an obfuscated file.

### GET `/api/health`
Health check endpoint.

## Obfuscation Process

The obfuscator works with **ELF (Executable and Linkable Format)** binaries only:

1. **File Upload & Validation**: 
   - File is uploaded and validated for ELF magic number (0x7F454C46)
   - Digital signature verified using RSA-PSS
2. **Encryption**: ELF binary is encrypted using selected algorithm (XOR or RSA)
3. **Loader Generation**: Creates a self-extracting ELF executable that:
   - Decrypts the embedded binary at runtime
   - Writes it to `/tmp` with a random name
   - Executes it and cleans up afterwards
4. **Output**: Returns the obfuscated ELF binary ready for download

### Supported File Formats

- **ELF binaries only** (Linux executables and shared libraries)
- Common extensions: `.elf`, `.bin`, `.out`, `.so`
- Files with no extension are also accepted (validated by magic number)

### Encryption Types

- **XOR**: Fast bitwise encryption with random key (1 byte)
- **RSA**: Small-scale RSA encryption with 4-bit primes (for demonstration)

## Python Obfuscator Script

The `obfuscator.py` script accepts these arguments:
```bash
python3 obfuscator.py <input_file> -t <encryption_type> -o <output_file>
```

Example:
```bash
python3 obfuscator.py binary.exe -t xor -o obfuscated_binary.exe
python3 obfuscator.py binary.exe -t rsa -o obfuscated_binary.exe
```

The script outputs JSON with obfuscation details:
```json
{
  "success": true,
  "output_path": "/path/to/output",
  "encryption_type": "XOR",
  "original_size": 12345,
  "encrypted_size": 12345,
  "key_info": "Key: 123"
}
```

## Directory Structure
```
backend/
├── server.js           # Main Express server
├── package.json        # Node.js dependencies
├── requirements.txt    # Python dependencies
├── obfuscator.py       # Python obfuscator script
├── encryptor.py        # Encryption algorithms
├── uploads/            # Temporary uploads (auto-created)
├── output/             # Obfuscated files (auto-created)
└── README.md
```

## Digital Signature

Files are verified using RSA-PSS (2048-bit) digital signatures before obfuscation:
- **Algorithm**: RSA-PSS
- **Hash**: SHA-256
- **Salt Length**: 32 bytes
- **Key Storage**: Browser localStorage

This ensures file integrity and authenticity.
