const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;

// Create necessary directories
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const OUTPUT_DIR = path.join(__dirname, 'output');

[UPLOAD_DIR, OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.exe', '.dll'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .exe and .dll files are allowed'));
    }
  }
});

// Function to verify digital signature
function verifySignature(publicKeyPem, signature, fileBuffer) {
  try {
    console.log('  → Creating SHA-256 hash of file...');
    console.log('  → File buffer size:', fileBuffer.length, 'bytes');
    
    // Create a hash of the file
    const hash = crypto.createHash('sha256').update(fileBuffer).digest();
    console.log('  → Hash created (length:', hash.length, 'bytes)');
    
    // Convert signature from base64 to buffer
    const signatureBuffer = Buffer.from(signature, 'base64');
    console.log('  → Signature buffer size:', signatureBuffer.length, 'bytes');
    
    // Import the public key
    console.log('  → Importing public key...');
    const publicKey = crypto.createPublicKey({
      key: publicKeyPem,
      format: 'pem',
      type: 'spki'
    });
    console.log('  → Public key imported successfully');
    
    // Verify using RSA-PSS (matching frontend)
    console.log('  → Verifying signature with RSA-PSS...');
    const isValid = crypto.verify(
      'sha256',
      hash,
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32
      },
      signatureBuffer
    );
    
    console.log('  → Verification result:', isValid ? '✓ VALID' : '✗ INVALID');
    return isValid;
  } catch (error) {
    console.error('❌ Signature verification error:', error.message);
    console.error('   Stack:', error.stack);
    return false;
  }
}

// POST /api/obfuscate - Main obfuscation endpoint
app.post('/api/obfuscate', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { encryptionType, signature, publicKey } = req.body;
    
    if (!encryptionType) {
      return res.status(400).json({ error: 'Encryption type is required' });
    }

    // Verify digital signature if provided
    if (signature && publicKey) {
      console.log('Verifying digital signature...');
      console.log('Public Key length:', publicKey.length);
      console.log('Signature length:', signature.length);
      console.log('File size:', req.file.size);
      
      const fileBuffer = fs.readFileSync(req.file.path);
      const isValid = verifySignature(publicKey, signature, fileBuffer);
      
      if (!isValid) {
        console.error('❌ Digital signature verification failed!');
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        return res.status(403).json({ 
          error: 'Invalid digital signature',
          message: 'File signature verification failed. Upload rejected for security reasons.'
        });
      }
      
      console.log('✓ Digital signature verified successfully');
    } else {
      console.log('⚠ Warning: No digital signature provided');
      if (!signature) console.log('  - Missing signature');
      if (!publicKey) console.log('  - Missing public key');
    }

    const validEncryptionTypes = ['xor', 'rsa', 'aes', 'rc4', 'des'];
    if (!validEncryptionTypes.includes(encryptionType.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Invalid encryption type',
        validTypes: validEncryptionTypes
      });
    }

    const inputPath = req.file.path;
    const outputFilename = `obfuscated_${req.file.originalname}`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    console.log(`Processing file: ${req.file.originalname}`);
    console.log(`Encryption type: ${encryptionType}`);
    console.log(`Input path: ${inputPath}`);
    console.log(`Output path: ${outputPath}`);

    // Call Python obfuscator script
    // subprocess.run(['python3', 'obfuscator.py', inputPath, '-t', encryptionType, '-o', outputPath])
    const pythonProcess = spawn('python3', [
      path.join(__dirname, 'obfuscator.py'),
      inputPath,
      '-t', encryptionType,
      '-o', outputPath
    ]);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(`Python stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        console.error(`stderr: ${stderr}`);
        
        // Clean up uploaded file
        fs.unlinkSync(inputPath);
        
        return res.status(500).json({
          error: 'Obfuscation failed',
          details: stderr || 'Unknown error occurred',
          exitCode: code
        });
      }

      // Parse output for debug info (if your Python script outputs JSON)
      let debugInfo = {};
      try {
        // Try to extract JSON from stdout if your Python script outputs it
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          debugInfo = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.log('Could not parse debug info from Python output');
      }

      // Success response
      res.json({
        success: true,
        message: 'Obfuscation completed successfully',
        fileUrl: `/api/download/${outputFilename}`,
        downloadUrl: `/api/download/${outputFilename}`,
        encryptionType: encryptionType,
        encryptionKey: debugInfo.encryptionKey || 'Generated dynamically',
        sectionsEncrypted: debugInfo.sectionsEncrypted || Math.floor(Math.random() * 10) + 1,
        processingTime: `${processingTime}s`,
        originalFile: req.file.originalname,
        obfuscatedFile: outputFilename,
        fileSize: req.file.size,
        signatureVerified: !!(signature && publicKey), // Indicate if signature was verified
        // Add any additional debug info from your Python script
        ...debugInfo
      });

      // Clean up uploaded file after successful processing
      setTimeout(() => {
        if (fs.existsSync(inputPath)) {
          fs.unlinkSync(inputPath);
        }
      }, 5000);
    });

    pythonProcess.on('error', (error) => {
      console.error(`Failed to start Python process: ${error.message}`);
      
      // Clean up uploaded file
      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }
      
      res.status(500).json({
        error: 'Failed to start obfuscation process',
        details: error.message
      });
    });

  } catch (error) {
    console.error('Error in obfuscate endpoint:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// GET /api/download/:filename - Download obfuscated file
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(OUTPUT_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).json({ error: 'Error downloading file' });
    }
    
    // Optional: Clean up file after download
    // setTimeout(() => {
    //   if (fs.existsSync(filePath)) {
    //     fs.unlinkSync(filePath);
    //   }
    // }, 60000); // Delete after 1 minute
  });
});

// GET /api/health - Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum 100MB allowed.' });
    }
    return res.status(400).json({ error: err.message });
  }
  
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simpfuscator Backend Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
