# Simpfuscator Backend

Express.js backend server for the Simpfuscator obfuscation tool.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Create your `obfuscator.py` script in this directory

4. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### POST `/api/obfuscate`
Upload and obfuscate a binary file.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: Binary file (.exe or .dll)
  - `encryptionType`: One of: `xor`, `rsa`, `aes`, `rc4`, `des`

**Response:**
```json
{
  "success": true,
  "message": "Obfuscation completed successfully",
  "fileUrl": "/api/download/obfuscated_file.exe",
  "downloadUrl": "/api/download/obfuscated_file.exe",
  "encryptionType": "xor",
  "encryptionKey": "Generated dynamically",
  "sectionsEncrypted": 5,
  "processingTime": "2.34s",
  "originalFile": "file.exe",
  "obfuscatedFile": "obfuscated_file.exe"
}
```

### GET `/api/download/:filename`
Download an obfuscated file.

### GET `/api/health`
Health check endpoint.

## Python Obfuscator Script

Your `obfuscator.py` should accept these arguments:
```bash
python3 obfuscator.py <input_file> -t <encryption_type> -o <output_file>
```

Example:
```python
import sys
import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('input_file', help='Input binary file')
    parser.add_argument('-t', '--type', required=True, help='Encryption type')
    parser.add_argument('-o', '--output', required=True, help='Output file')
    args = parser.parse_args()
    
    # Your obfuscation logic here
    print(f"Processing {args.input_file} with {args.type} encryption...")
    
    # Optionally output JSON for debug info
    # import json
    # print(json.dumps({
    #     "encryptionKey": "ABC123",
    #     "sectionsEncrypted": 5
    # }))

if __name__ == '__main__':
    main()
```

## Directory Structure
```
backend/
├── server.js          # Main Express server
├── package.json       # Dependencies
├── obfuscator.py      # Your Python obfuscator (create this)
├── uploads/           # Temporary uploads (auto-created)
├── output/            # Obfuscated files (auto-created)
└── README.md
```
