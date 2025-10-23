# Digital Signature Implementation

## Overview
The Simpfuscator dashboard now implements **RSA-based digital signatures** for secure file uploads. This ensures file integrity and authenticity before obfuscation.

## How It Works

### 1. **Key Generation (Frontend)**
When you first open the dashboard:
- A unique RSA-PSS key pair (2048-bit) is generated using Web Crypto API
- Private key: Stored securely in browser's localStorage
- Public key: Sent to backend with each upload for verification
- Keys persist across sessions unless cleared

### 2. **File Signing (Before Upload)**
When user uploads a file:
1. File is hashed using SHA-256
2. Hash is signed with user's private key (RSA-PSS)
3. Signature is sent along with file and public key to backend

### 3. **Signature Verification (Backend)**
Backend verifies before obfuscating:
1. Receives file, signature, and public key
2. Computes SHA-256 hash of received file
3. Verifies signature using provided public key
4. **Rejects** file if signature is invalid
5. **Proceeds** with obfuscation if valid

## Security Benefits

✅ **File Integrity** - Ensures file wasn't modified during upload  
✅ **Authentication** - Confirms file came from legitimate source  
✅ **Non-repudiation** - User can't deny uploading the file  
✅ **Tamper Detection** - Any modification invalidates signature  

## Visual Indicators

### Frontend:
- **"Signing file with digital signature..."** - Shows during signing process
- **Green Shield Badge** - Appears in obfuscation details when verified

### Backend:
- **Console Logs:**
  - `Verifying digital signature...`
  - `✓ Digital signature verified successfully`
  - `Warning: No digital signature provided` (if signature missing)

## API Changes

### POST `/api/obfuscate`
**New Request Fields:**
```javascript
{
  file: File,              // The binary file
  encryptionType: string,  // xor, rsa, aes, rc4, des
  signature: string,       // Base64 encoded RSA signature (NEW)
  publicKey: string        // PEM formatted public key (NEW)
}
```

**New Response Fields:**
```json
{
  "signatureVerified": true,  // Indicates if signature was verified
  // ... other fields
}
```

## Error Handling

### Invalid Signature:
```json
{
  "error": "Invalid digital signature",
  "message": "File signature verification failed. Upload rejected for security reasons."
}
```

Returns **403 Forbidden** and file is automatically deleted.

## Technical Details

### Algorithms Used:
- **Signing Algorithm:** RSA-PSS (Probabilistic Signature Scheme)
- **Key Size:** 2048 bits
- **Hash Function:** SHA-256
- **Salt Length:** 32 bytes

### Key Storage:
- **Private Key:** Browser localStorage (PKCS#8 format, base64 encoded)
- **Public Key:** Browser localStorage (SPKI/PEM format)

### Browser Compatibility:
Uses Web Crypto API - supported in:
- Chrome 37+
- Firefox 34+
- Safari 11+
- Edge 79+

## Usage

### Normal Usage:
No action required! Signature happens automatically:
1. Select encryption type
2. Upload file
3. Click "Obfuscate File"
4. ✓ File is automatically signed and verified

### Clear Stored Keys:
If you need to regenerate keys (e.g., security reset):
```javascript
// In browser console:
localStorage.removeItem('simpfuscator_private_key');
localStorage.removeItem('simpfuscator_public_key');
// Refresh page to generate new keys
```

Or use the utility function:
```javascript
import { clearStoredKeys } from '@/utils/digitalSignature';
clearStoredKeys();
```

## Testing

### Test Signature Verification:
1. Upload a file normally ✓ Should succeed
2. Modify backend to reject signatures ✗ Should fail with 403
3. Check browser DevTools → Network → obfuscate request
4. Verify `signature` and `publicKey` fields are present

### Backend Logs:
```
Verifying digital signature...
✓ Digital signature verified successfully
Processing file: test.exe
Encryption type: aes
```

## Files Modified/Created

**Frontend:**
- `src/utils/digitalSignature.ts` - Digital signature utilities
- `src/pages/Dashboard.tsx` - Integration with upload flow

**Backend:**
- `backend/server.js` - Signature verification logic

## Security Considerations

⚠️ **Important Notes:**

1. **Client-side key generation** - Keys generated in browser
   - Suitable for file integrity verification
   - Not meant for cryptographic authentication

2. **localStorage** - Keys stored in browser
   - Cleared if user clears browser data
   - Accessible to JavaScript on same origin

3. **This is NOT** end-to-end encryption
   - Ensures file integrity during upload
   - Server still has access to original file

4. **For production:**
   - Consider server-side key management
   - Use HTTPS for all connections
   - Implement rate limiting
   - Add additional authentication layers

## Future Enhancements

Potential improvements:
- [ ] Server-side key management
- [ ] Certificate-based signatures
- [ ] Multiple signature algorithms
- [ ] Key expiration/rotation
- [ ] Audit trail of signed uploads
- [ ] Export/import key pairs
