#!/bin/bash
# Create a simple test ELF binary

cat > test_hello.c << 'EOF'
#include <stdio.h>

int main() {
    printf("Hello from the obfuscated binary!\n");
    printf("If you see this, decryption worked!\n");
    return 0;
}
EOF

echo "[+] Compiling test binary..."
gcc test_hello.c -o test_hello

if [ -f test_hello ]; then
    echo "[+] Test binary created: test_hello"
    echo "[+] Testing original binary:"
    ./test_hello
    echo ""
    echo "[+] Now testing obfuscation with XOR:"
    python3 obfuscator.py test_hello -t xor -o test_hello_xor
    echo ""
    if [ -f test_hello_xor ]; then
        echo "[+] Testing XOR obfuscated binary:"
        ./test_hello_xor
        echo ""
    fi
    echo ""
    echo "[+] Now testing obfuscation with RSA:"
    python3 obfuscator.py test_hello -t rsa -o test_hello_rsa
    echo ""
    if [ -f test_hello_rsa ]; then
        echo "[+] Testing RSA obfuscated binary:"
        ./test_hello_rsa
        echo ""
    fi
    
    echo "[+] Now testing obfuscation with AES:"
    python3 obfuscator.py test_hello -t aes -o test_hello_aes
    echo ""
    if [ -f test_hello_aes ]; then
        echo "[+] Testing AES obfuscated binary:"
        ./test_hello_aes
        echo ""
    fi
    
    echo "[+] Cleanup..."
    rm -f test_hello test_hello.c test_hello_xor test_hello_rsa test_hello_aes
    echo "[+] Done!"
else
    echo "[-] Failed to create test binary"
    exit 1
fi
