import random
from Crypto.Util.number import *
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad

# put more shit here
xor_dec_func = """
void decrypt_xor(unsigned char *data, size_t len, unsigned char key) {
    for (size_t i = 0; i < len; i++) {
        data[i] = data[i] ^ key;
    }
}"""

rsa_dec_func = """
long long pow_mod(long long base, long long exp, long long mod) {
    long long res = 1;
    base %= mod;
    while (exp > 0) {
        if (exp % 2 == 1) res = (res * base) % mod;
        base = (base * base) % mod;
        exp /= 2;
    }
    return res;
}

void decrypt_rsa(unsigned char *data, size_t len, long long d, long long n, int plaintext_block_size) {
    // Each encrypted block is 4 bytes (ciphertext_block_size)
    const int ciphertext_block_size = 4;
    
    // Calculate number of blocks
    size_t num_blocks = len / ciphertext_block_size;
    
    // Temporary buffer for decrypted data
    unsigned char *decrypted = malloc(num_blocks * plaintext_block_size);
    if (!decrypted) return;
    
    // Decrypt each block
    for (size_t i = 0; i < num_blocks; i++) {
        // Read 4-byte ciphertext block
        long long ciphertext = 0;
        for (int j = 0; j < ciphertext_block_size; j++) {
            ciphertext = (ciphertext << 8) | data[i * ciphertext_block_size + j];
        }
        
        // Decrypt: m = c^d mod n
        long long plaintext = pow_mod(ciphertext, d, n);
        
        // Write plaintext block (2 bytes for block_size=2)
        for (int j = plaintext_block_size - 1; j >= 0; j--) {
            decrypted[i * plaintext_block_size + j] = (unsigned char)(plaintext & 0xFF);
            plaintext >>= 8;
        }
    }
    
    // Copy decrypted data back
    memcpy(data, decrypted, num_blocks * plaintext_block_size);
    free(decrypted);
}"""

aes_dec_func = """
// AES-128 decryption implementation (CBC mode)
// S-box for AES
static const unsigned char sbox[256] = {
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
};

// Inverse S-box
static const unsigned char inv_sbox[256] = {
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
    0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
    0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
    0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
    0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
    0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
    0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
    0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
    0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
    0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
    0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
};

// Rcon for key expansion
static const unsigned char Rcon[11] = {
    0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36
};

void aes_add_round_key(unsigned char *state, unsigned char *round_key) {
    for (int i = 0; i < 16; i++) {
        state[i] ^= round_key[i];
    }
}

void aes_inv_sub_bytes(unsigned char *state) {
    for (int i = 0; i < 16; i++) {
        state[i] = inv_sbox[state[i]];
    }
}

void aes_inv_shift_rows(unsigned char *state) {
    unsigned char temp;
    // Row 1: shift right by 1
    temp = state[13];
    state[13] = state[9];
    state[9] = state[5];
    state[5] = state[1];
    state[1] = temp;
    // Row 2: shift right by 2
    temp = state[2];
    state[2] = state[10];
    state[10] = temp;
    temp = state[6];
    state[6] = state[14];
    state[14] = temp;
    // Row 3: shift right by 3
    temp = state[3];
    state[3] = state[7];
    state[7] = state[11];
    state[11] = state[15];
    state[15] = temp;
}

unsigned char aes_xtime(unsigned char x) {
    return ((x << 1) ^ (((x >> 7) & 1) * 0x1b));
}

unsigned char aes_multiply(unsigned char x, unsigned char y) {
    return (((y & 1) * x) ^
            ((y >> 1 & 1) * aes_xtime(x)) ^
            ((y >> 2 & 1) * aes_xtime(aes_xtime(x))) ^
            ((y >> 3 & 1) * aes_xtime(aes_xtime(aes_xtime(x)))) ^
            ((y >> 4 & 1) * aes_xtime(aes_xtime(aes_xtime(aes_xtime(x))))));
}

void aes_inv_mix_columns(unsigned char *state) {
    unsigned char a, b, c, d;
    for (int i = 0; i < 4; i++) {
        a = state[i*4];
        b = state[i*4 + 1];
        c = state[i*4 + 2];
        d = state[i*4 + 3];
        state[i*4] = aes_multiply(a, 0x0e) ^ aes_multiply(b, 0x0b) ^ aes_multiply(c, 0x0d) ^ aes_multiply(d, 0x09);
        state[i*4 + 1] = aes_multiply(a, 0x09) ^ aes_multiply(b, 0x0e) ^ aes_multiply(c, 0x0b) ^ aes_multiply(d, 0x0d);
        state[i*4 + 2] = aes_multiply(a, 0x0d) ^ aes_multiply(b, 0x09) ^ aes_multiply(c, 0x0e) ^ aes_multiply(d, 0x0b);
        state[i*4 + 3] = aes_multiply(a, 0x0b) ^ aes_multiply(b, 0x0d) ^ aes_multiply(c, 0x09) ^ aes_multiply(d, 0x0e);
    }
}

void aes_key_expansion(unsigned char *key, unsigned char *round_keys) {
    int i, j;
    unsigned char temp[4], k;
    
    // First round key is the key itself
    for (i = 0; i < 16; i++) {
        round_keys[i] = key[i];
    }
    
    // Generate other round keys
    for (i = 1; i <= 10; i++) {
        // Rotate and substitute
        for (j = 0; j < 4; j++) {
            temp[j] = sbox[round_keys[(i-1) * 16 + 12 + ((j+1)%4)]];
        }
        temp[0] ^= Rcon[i];
        
        // XOR with previous round key
        for (j = 0; j < 4; j++) {
            round_keys[i * 16 + j] = round_keys[(i-1) * 16 + j] ^ temp[j];
        }
        for (j = 4; j < 16; j++) {
            round_keys[i * 16 + j] = round_keys[i * 16 + j - 4] ^ round_keys[(i-1) * 16 + j];
        }
    }
}

void aes_decrypt_block(unsigned char *input, unsigned char *output, unsigned char *round_keys) {
    unsigned char state[16];
    int round;
    
    for (int i = 0; i < 16; i++) {
        state[i] = input[i];
    }
    
    aes_add_round_key(state, round_keys + 160); // Start with last round key
    
    for (round = 9; round >= 0; round--) {
        aes_inv_shift_rows(state);
        aes_inv_sub_bytes(state);
        aes_add_round_key(state, round_keys + (round * 16));
        if (round != 0) {
            aes_inv_mix_columns(state);
        }
    }
    
    for (int i = 0; i < 16; i++) {
        output[i] = state[i];
    }
}

void decrypt_aes(unsigned char *data, size_t len, unsigned char *key, unsigned char *iv) {
    unsigned char round_keys[176]; // 11 round keys of 16 bytes each
    aes_key_expansion(key, round_keys);
    
    unsigned char prev_cipher[16];
    unsigned char decrypted_block[16];
    memcpy(prev_cipher, iv, 16);
    
    // Decrypt each 16-byte block in CBC mode
    for (size_t i = 0; i < len; i += 16) {
        unsigned char cipher_backup[16];
        memcpy(cipher_backup, data + i, 16);
        
        aes_decrypt_block(data + i, decrypted_block, round_keys);
        
        // XOR with previous ciphertext (CBC mode)
        for (int j = 0; j < 16; j++) {
            data[i + j] = decrypted_block[j] ^ prev_cipher[j];
        }
        
        memcpy(prev_cipher, cipher_backup, 16);
    }
}"""

def encrypt_xor(shellcode : bytes):
    key = [random.randint(0x1, 0xff), 0]
    enc = bytes(a ^ key[0] for a in shellcode)
    return enc, key

def encrypt_rsa(shellcode : bytes):
    # Use larger primes for block-based RSA
    # Block size of 2 bytes = 16 bits, so we need n > 65536
    BLOCK_SIZE = 2  # 2 bytes per block
    
    while True:
        try:
            # Use 12-bit primes, giving us n with ~24 bits
            # This ensures n > 65536 (2^16) for 2-byte blocks
            p, q = getPrime(12), getPrime(12)
            n = p * q
            
            # Ensure n is large enough for our block size
            max_block_value = (1 << (BLOCK_SIZE * 8)) - 1  # 2^16 - 1 = 65535
            assert n > max_block_value, f"n={n} must be > {max_block_value}"
            
            # Choose public exponent
            e = 65537  # Standard RSA public exponent
            phi = (p - 1) * (q - 1)
            
            # Ensure e and phi are coprime
            from math import gcd
            if gcd(e, phi) != 1:
                continue
            
            # Calculate private exponent
            d = inverse(e, phi)
            break
        except Exception as ex:
            continue
    
    key = (d, n, BLOCK_SIZE)
    
    # Encrypt in blocks
    enc_blocks = []
    for i in range(0, len(shellcode), BLOCK_SIZE):
        # Get block of bytes
        block = shellcode[i:i+BLOCK_SIZE]
        
        # Pad last block if needed
        if len(block) < BLOCK_SIZE:
            block = block + b'\x00' * (BLOCK_SIZE - len(block))
        
        # Convert block to integer (big-endian)
        m = int.from_bytes(block, 'big')
        
        # Encrypt: c = m^e mod n
        c = pow(m, e, n)
        
        # Convert back to bytes (using enough bytes to hold the ciphertext)
        # We need ceil(log2(n)/8) bytes, but for simplicity use 4 bytes
        c_bytes = c.to_bytes(4, 'big')
        enc_blocks.append(c_bytes)
    
    # Concatenate all encrypted blocks
    enc = b''.join(enc_blocks)
    
    # Return encrypted data and keys: (d, n, block_size)
    return enc, key

def encrypt_aes(shellcode : bytes):
    # AES-128 encryption with CBC mode
    key = get_random_bytes(16)  # 128-bit key
    iv = get_random_bytes(16)   # 128-bit IV
    
    cipher = AES.new(key, AES.MODE_CBC, iv)
    
    # Pad data to multiple of 16 bytes (AES block size)
    padded_data = pad(shellcode, AES.block_size)
    
    # Encrypt
    enc = cipher.encrypt(padded_data)
    
    # Return encrypted data and key info: (key, iv, original_length)
    return enc, (key, iv, len(shellcode))
