#!/bin/bash
# Script to create a simple test ELF binary

echo "Creating test ELF binary..."

# Create a simple C program
cat > test.c << 'EOF'
#include <stdio.h>

int main() {
    printf("Hello from test ELF binary!\n");
    return 0;
}
EOF

# Compile it
gcc test.c -o test_binary

# Check if compilation succeeded
if [ -f test_binary ]; then
    echo "✓ Test ELF binary created: test_binary"
    echo ""
    echo "File information:"
    file test_binary
    echo ""
    echo "First 4 bytes (should be 7f 45 4c 46):"
    xxd -l 4 test_binary
    echo ""
    echo "You can now upload 'test_binary' through the web interface"
    
    # Clean up source file
    rm test.c
else
    echo "✗ Failed to create test binary"
    exit 1
fi
