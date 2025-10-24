#!/usr/bin/env python3
"""
Test script to verify encryption/decryption logic
"""

from encryptor import encrypt_xor, encrypt_rsa, encrypt_aes
from Crypto.Util.Padding import unpad
from Crypto.Cipher import AES

def test_xor():
    print("Testing XOR Encryption...")
    original = b"Hello, World! This is a test."
    
    # Encrypt
    encrypted, key = encrypt_xor(original)
    print(f"  Original length: {len(original)}")
    print(f"  Encrypted length: {len(encrypted)}")
    print(f"  Key: 0x{key[0]:02x}")
    
    # Decrypt (XOR is symmetric)
    decrypted = bytes(a ^ key[0] for a in encrypted)
    
    # Verify
    if decrypted == original:
        print("  ✓ XOR encryption/decryption works correctly!")
    else:
        print("  ✗ XOR decryption failed!")
        print(f"    Expected: {original}")
        print(f"    Got: {decrypted}")
    print()

def test_rsa():
    print("Testing RSA Block Encryption...")
    original = b"Hello, World! This is a test."
    
    # Encrypt
    encrypted, key = encrypt_rsa(original)
    d, n, block_size = key
    
    print(f"  Original length: {len(original)} bytes")
    print(f"  Encrypted length: {len(encrypted)} bytes")
    print(f"  Block size: {block_size} bytes")
    print(f"  Modulus (n): {n} ({n.bit_length()} bits)")
    print(f"  Private exp (d): {d}")
    print(f"  Number of blocks: {len(original) // block_size + (1 if len(original) % block_size else 0)}")
    
    # Decrypt
    ciphertext_block_size = 4  # Each encrypted block is 4 bytes
    num_blocks = len(encrypted) // ciphertext_block_size
    
    decrypted_blocks = []
    for i in range(num_blocks):
        # Read 4-byte ciphertext block
        ciphertext = int.from_bytes(
            encrypted[i * ciphertext_block_size:(i + 1) * ciphertext_block_size],
            'big'
        )
        
        # Decrypt: m = c^d mod n
        plaintext = pow(ciphertext, d, n)
        
        # Convert back to bytes
        plaintext_bytes = plaintext.to_bytes(block_size, 'big')
        decrypted_blocks.append(plaintext_bytes)
    
    # Concatenate and remove padding
    decrypted = b''.join(decrypted_blocks)[:len(original)]
    
    # Verify
    if decrypted == original:
        print("  ✓ RSA encryption/decryption works correctly!")
    else:
        print("  ✗ RSA decryption failed!")
        print(f"    Expected: {original}")
        print(f"    Got: {decrypted}")
        print(f"    Expected length: {len(original)}")
        print(f"    Got length: {len(decrypted)}")
    print()

def test_aes():
    print("Testing AES-128 CBC Encryption...")
    original = b"Hello, World! This is a test for AES encryption."
    
    # Encrypt
    encrypted, key = encrypt_aes(original)
    aes_key, iv, original_len = key
    
    print(f"  Original length: {len(original)} bytes")
    print(f"  Encrypted length: {len(encrypted)} bytes")
    print(f"  Key: {aes_key.hex()[:32]}...")
    print(f"  IV: {iv.hex()[:32]}...")
    print(f"  Original length stored: {original_len}")
    
    # Decrypt
    cipher = AES.new(aes_key, AES.MODE_CBC, iv)
    decrypted_padded = cipher.decrypt(encrypted)
    
    # Remove padding
    decrypted = unpad(decrypted_padded, AES.block_size)
    
    # Verify
    if decrypted == original:
        print("  ✓ AES encryption/decryption works correctly!")
    else:
        print("  ✗ AES decryption failed!")
        print(f"    Expected: {original}")
        print(f"    Got: {decrypted}")
        print(f"    Expected length: {len(original)}")
        print(f"    Got length: {len(decrypted)}")
    print()

if __name__ == "__main__":
    test_xor()
    test_rsa()
    test_aes()
