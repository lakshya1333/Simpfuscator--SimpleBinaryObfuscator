/**
 * Digital Signature Utility using Web Crypto API
 * Implements RSA-PSS for signing files before upload
 */

// Generate RSA key pair for digital signature
export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return await window.crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true, // extractable
    ["sign", "verify"]
  );
}

// Export public key to PEM format
export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("spki", key);
  const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
  const exportedAsBase64 = window.btoa(exportedAsString);
  return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
}

// Export private key to base64
export async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("pkcs8", key);
  const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
  return window.btoa(exportedAsString);
}

// Import public key from PEM format
export async function importPublicKey(pem: string): Promise<CryptoKey> {
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = pem.substring(
    pemHeader.length,
    pem.length - pemFooter.length
  ).replace(/\s/g, "");
  const binaryDer = window.atob(pemContents);
  const binaryDerArray = new Uint8Array(binaryDer.length);
  for (let i = 0; i < binaryDer.length; i++) {
    binaryDerArray[i] = binaryDer.charCodeAt(i);
  }

  return await window.crypto.subtle.importKey(
    "spki",
    binaryDerArray.buffer,
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    },
    true,
    ["verify"]
  );
}

// Sign file data
export async function signFile(
  privateKey: CryptoKey,
  fileData: ArrayBuffer
): Promise<string> {
  const signature = await window.crypto.subtle.sign(
    {
      name: "RSA-PSS",
      saltLength: 32,
    },
    privateKey,
    fileData
  );

  // Convert signature to base64
  const signatureArray = new Uint8Array(signature);
  const signatureString = String.fromCharCode(...signatureArray);
  return window.btoa(signatureString);
}

// Hash file for signing
export async function hashFile(file: File): Promise<ArrayBuffer> {
  const buffer = await file.arrayBuffer();
  return await window.crypto.subtle.digest("SHA-256", buffer);
}

// Get or create key pair from localStorage
export async function getOrCreateKeyPair(): Promise<{
  keyPair: CryptoKeyPair;
  publicKeyPem: string;
}> {
  // Check if keys exist in localStorage
  const storedPrivateKey = localStorage.getItem("simpfuscator_private_key");
  const storedPublicKey = localStorage.getItem("simpfuscator_public_key");

  if (storedPrivateKey && storedPublicKey) {
    // Import existing keys
    const privateKeyBuffer = Uint8Array.from(
      atob(storedPrivateKey),
      (c) => c.charCodeAt(0)
    );
    const privateKey = await window.crypto.subtle.importKey(
      "pkcs8",
      privateKeyBuffer,
      {
        name: "RSA-PSS",
        hash: "SHA-256",
      },
      true,
      ["sign"]
    );

    const publicKey = await importPublicKey(storedPublicKey);

    return {
      keyPair: { privateKey, publicKey },
      publicKeyPem: storedPublicKey,
    };
  } else {
    // Generate new key pair
    const keyPair = await generateKeyPair();
    const publicKeyPem = await exportPublicKey(keyPair.publicKey);
    const privateKeyBase64 = await exportPrivateKey(keyPair.privateKey);

    // Store in localStorage
    localStorage.setItem("simpfuscator_private_key", privateKeyBase64);
    localStorage.setItem("simpfuscator_public_key", publicKeyPem);

    return {
      keyPair,
      publicKeyPem,
    };
  }
}

// Clear stored keys (for reset)
export function clearStoredKeys() {
  localStorage.removeItem("simpfuscator_private_key");
  localStorage.removeItem("simpfuscator_public_key");
}
