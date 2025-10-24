import sys
import lief
import tempfile
import subprocess
import shutil
import os
from encryptor import *
from typing import List, Tuple, Optional

# Note: This script must run in a Linux environment (native Linux, WSL, or Docker)
# It generates ELF binaries and requires Linux headers and GCC

# DIET_LIBC_PATH = os.environ.get("DIET_LIBC_PATH")
# if not DIET_LIBC_PATH:
#     print("Error: DIET_LIBC_PATH environment variable not set.")
#     print("Please set it to the root of your dietlibc installation.")
#     sys.exit(1)

LOADER_DIR = os.path.join(os.path.dirname(__file__), "loader")
LOADER_BINARY = os.path.join(LOADER_DIR, "loader.elf")

PAGE_SIZE = 0x1000

def compile_c_string(
    c_source: str,
    output_path: Optional[str] = None,
    compiler: str = "gcc",
    flags: Optional[List[str]] = None,
    extra_env: Optional[dict] = None,
    workdir: Optional[str] = None,
) -> Tuple[bool, str, str, Optional[str]]:
    """Returns (success, stdout, stderr, output_path)."""
    if shutil.which(compiler) is None:
        return False, "", f"Compiler {compiler} not found in PATH", None

    flags = flags or []
    cleanup_dir = False
    if workdir is None:
        tmpdir = tempfile.mkdtemp(prefix="ccompile_")
        cleanup_dir = True
    else:
        tmpdir = workdir
        os.makedirs(tmpdir, exist_ok=True)

    src_path = os.path.join(tmpdir, "gen.c")
    try:
        with open(src_path, "w", encoding="utf-8") as f:
            f.write(c_source)

        if output_path is None:
            output_path = os.path.join(tmpdir, "a.out")

        cmd = [compiler, src_path, "-o", output_path] + flags

        env = os.environ.copy()
        if extra_env:
            env.update(extra_env)

        proc = subprocess.run(cmd, cwd=tmpdir, env=env,
                              stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        success = proc.returncode == 0

        if success and os.path.exists(output_path):
            os.chmod(output_path, 0o755)

        return success, proc.stdout, proc.stderr, (output_path if success else None)

    finally:
        if cleanup_dir:
            pass  

def bytes_to_c_array(b: bytes, per_line: int = 12) -> str:
    parts = []
    for i in range(0, len(b), per_line):
        chunk = b[i:i+per_line]
        parts.append(", ".join(f"0x{byte:02x}" for byte in chunk))
    inner = ",\n    ".join(parts) if parts else ""
    return "{\n    " + inner + "\n}"

symbols = ['xor', 'rsa', 'aes']
class Obfuscator:

    def __init__(self, filename):
        self.filename = filename
        self.output_filename = os.path.basename(filename) + "_obfuscated"
        try:
            self.binary = lief.ELF.parse(self.filename)
            if not self.binary:
                raise lief.bad_file(f"LIEF could not parse {filename}")
        except lief.bad_file as e:
            print(f"Error parsing ELF file: {e}")
            sys.exit(1)
        self.encryptions = [encrypt_xor, encrypt_rsa, encrypt_aes]

    def obfuscate(self, option, output_path=None):
        print(f"[+] Starting obfuscation for '{self.filename}'")
        
        # Set default output path if not provided
        if output_path is None:
            output_path = os.path.join(
                os.path.dirname(self.filename),
                self.output_filename
            )
        
        raw = open(self.filename, 'rb').read()
        enc, key = self.encryptions[option-1](raw) 

        # Generate function signature based on encryption type
        if option == 1:  # XOR
            func_sign = f'decrypt_xor(elf_bytes, elf_len, {key[0]})'
        elif option == 2:  # RSA
            func_sign = f'decrypt_rsa(elf_bytes, elf_len, {key[0]}, {key[1]}, {key[2]})'
        else:  # AES
            func_sign = f'decrypt_aes(elf_bytes, elf_len, aes_key, aes_iv)'
        
        # For RSA and AES, the decrypted length should be the original length
        # For XOR, encrypted and decrypted lengths are the same
        decrypted_len = len(raw) if option in [2, 3] else len(enc)
        
        # Generate AES key and IV arrays if AES is selected
        aes_key_array = ""
        aes_iv_array = ""
        if option == 3:
            aes_key_array = f"static unsigned char aes_key[] = {bytes_to_c_array(key[0])};"
            aes_iv_array = f"static unsigned char aes_iv[] = {bytes_to_c_array(key[1])};"
        
        c_code = f'''#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include <string.h>
#include <errno.h>
#include <stdint.h>
#include <stddef.h>

{xor_dec_func}
{rsa_dec_func}
{aes_dec_func}

size_t elf_len = {len(enc)};
size_t decrypted_len = {decrypted_len};

{aes_key_array}
{aes_iv_array}

static unsigned char elf_bytes[] = {bytes_to_c_array(enc)};

int main() {{
    {func_sign};

    char tmpl[] = "/tmp/genelfXXXXXX";
    int fd = mkstemp(tmpl);
    if (fd < 0) {{
        perror("mkstemp");
        return 4;
    }}
    size_t written = 0;
    while (written < decrypted_len) {{
        ssize_t w = write(fd, elf_bytes + written, decrypted_len - written);
        if (w < 0) {{
            if (errno == EINTR) continue;
            perror("write");
            close(fd);
            unlink(tmpl);
            return 5;
        }}
        written += (size_t)w;
    }}

    /* flush & close */
    if (fsync(fd) == -1) {{
        /* not fatal, but warn */
        perror("fsync");
    }}
    if (close(fd) == -1) {{
        perror("close");
        unlink(tmpl);
        return 6;
    }}

    /* make executable for owner only */
    if (chmod(tmpl, S_IRWXU) == -1) {{
        perror("chmod");
        unlink(tmpl);
        return 7;
    }}

    /* fork and exec */
    pid_t pid = fork();
    if (pid < 0) {{
        perror("fork");
        unlink(tmpl);
        return 8;
    }}

    if (pid == 0) {{
        /* Child: exec the newly created file.
           Use absolute path in argv[0] to be safe. */
        char *const argv[] = {{ tmpl, NULL }};
        execv(tmpl, argv);
        /* If execv returns, it failed */
        perror("execv");
        _exit(127);
    }} else {{
        /* Parent: wait for child */
        int status = 0;
        if (waitpid(pid, &status, 0) == -1) {{
            perror("waitpid");
            /* attempt cleanup */
            if (unlink(tmpl) == -1) perror("unlink");
            return 9;
        }}
    

        /* remove the file */
        if (unlink(tmpl) == -1) {{
            perror("unlink");
            return 10;
        }} else {{
    
        }}
    }}
    return 0;
}}
'''
        success, stdout, stderr, compiled_path = compile_c_string(
            c_code, 
            output_path,  # Use the specified output path
            'gcc', 
            ['-O3', '-s']
        )
        
        print("--- Compilation Result ---")
        print(f"Success: {success}")
        print(f"Output Path: {compiled_path}")
        if stdout:
            print(f"STDOUT: {stdout}")
        if stderr:
            print(f"STDERR: {stderr}")
        print("--------------------------")
        
        if success:
            print(f"[+] Obfuscated binary created at: {compiled_path}")
            
            # Gather detailed information about the obfuscation
            import json
            
            # Calculate size changes
            size_diff = len(enc) - len(raw)
            size_ratio = (len(enc) / len(raw)) * 100 if len(raw) > 0 else 0
            
            # Encryption-specific details
            if option == 1:  # XOR
                encryption_details = {
                    "algorithm": "XOR Cipher",
                    "key_size": "8-bit",
                    "key_value": f"0x{key[0]:02x}",
                    "rounds": 1,
                    "mode": "Stream Cipher",
                    "block_size": "1 byte"
                }
                key_info = f"Key: 0x{key[0]:02x}"
            elif option == 2:  # RSA
                block_size = key[2] if len(key) > 2 else 1
                n_bits = key[1].bit_length()
                encryption_details = {
                    "algorithm": "RSA (Block-based)",
                    "key_size": f"{n_bits}-bit modulus",
                    "public_exponent": "65537",
                    "private_exponent": str(key[0])[:50] + "..." if len(str(key[0])) > 50 else str(key[0]),
                    "modulus": str(key[1])[:50] + "..." if len(str(key[1])) > 50 else str(key[1]),
                    "block_size": f"{block_size} bytes",
                    "rounds": 1,
                    "mode": f"Block encryption ({block_size * 8}-bit blocks)"
                }
                key_info = f"d={str(key[0])[:20]}..., n={str(key[1])[:20]}..., block_size={block_size}"
            else:  # AES
                encryption_details = {
                    "algorithm": "AES-128",
                    "key_size": "128-bit",
                    "mode": "CBC (Cipher Block Chaining)",
                    "block_size": "16 bytes",
                    "rounds": 10,
                    "key_value": key[0].hex()[:32] + "...",
                    "iv_value": key[1].hex()[:32] + "...",
                    "padding": "PKCS7"
                }
                key_info = f"Key: {key[0].hex()[:32]}..., IV: {key[1].hex()[:32]}..."
            
            result = {
                "success": True,
                "output_path": compiled_path,
                "encryption_type": ["XOR", "RSA", "AES"][option-1],
                "original_size": len(raw),
                "encrypted_size": len(enc),
                "size_difference": size_diff,
                "size_ratio": f"{size_ratio:.2f}%",
                "key_info": key_info,
                "encryption_details": encryption_details,
                "loader_type": "Self-extracting ELF",
                "loader_method": "tmpfs + execv",
                "bytes_encrypted": len(raw),  # Original bytes encrypted
                "ciphertext_size": len(enc),  # Actual encrypted output size
                "entropy_increased": True,
                "platform": "Linux ELF (x86_64)",
                "compiler": "GCC",
                "optimization": "O3 + strip"
            }
            print(json.dumps(result))
        else:
            print(f"[-] Compilation failed!")
            sys.exit(1)
        
        

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Binary Obfuscator')
    parser.add_argument('input_file', help='Input binary file to obfuscate')
    parser.add_argument('-t', '--type', required=True, choices=['xor', 'rsa', 'aes'], 
                        help='Encryption type (xor, rsa, or aes)')
    parser.add_argument('-o', '--output', required=True, 
                        help='Output path for obfuscated binary')
    
    args = parser.parse_args()
    
    # Map encryption type to option number
    encryption_map = {'xor': 1, 'rsa': 2, 'aes': 3}
    option = encryption_map[args.type.lower()]
    
    print(f"[+] Input file: {args.input_file}")
    print(f"[+] Encryption type: {args.type.upper()} (option {option})")
    print(f"[+] Output path: {args.output}")
    
    obfuscator = Obfuscator(args.input_file)
    obfuscator.obfuscate(option, args.output)