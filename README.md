
# Multi-Cipher Firefox Extension

This Firefox browser extension allows users to encode and decode messages using multiple ciphers: Blowfish, AES, ChaCha, and Twofish. It provides a simple popup interface where users can select a cipher, enter a password, input a message, and choose to encode or decode.

## Features
- Supports four ciphers: Blowfish, AES, ChaCha, and Twofish.
- Encode or decode messages with a user-provided password.
- Copy the result to the clipboard with a single click.
- User-friendly interface with error handling.

## Installation
1. **Clone the Repository**:
   ```
   git clone https://github.com/your-username/multi-cipher-extension.git
   ```
2. **Load the Extension in Firefox**:
   - Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
   - Click "Load Temporary Add-on…".
   - Select any file in the `multi-cipher-extension` folder (e.g., `manifest.json`).
   - The extension will load temporarily until Firefox restarts.

## Usage
1. Click the extension icon in the Firefox toolbar to open the popup.
2. Select a cipher from the dropdown (Blowfish, AES, ChaCha, or Twofish).
3. Enter a password (used as the encryption key).
4. Type or paste a message in the textarea.
5. Choose "Encode" to encrypt or "Decode" to decrypt (decoding requires a valid base64-encoded ciphertext).
6. Click "Process" to see the result.
7. Use the "Copy" button to copy the result to your clipboard.

## Files
- `manifest.json`: Extension manifest file.
- `popup.html`: Popup interface.
- `popup.js`: Logic for encoding/decoding with all ciphers.
- `popup.css`: Styles for the popup.
- `icon.png`: Extension icon (48x48 pixels).
- `blowfish.js`: Blowfish cipher implementation.
- `libsodium.js`: Simplified ChaCha20 implementation.
- `twofish.js`: Twofish cipher implementation.

## Security Notes
- **Ciphers**: AES and ChaCha are modern and recommended for production use. Blowfish and Twofish are secure but older; Blowfish has a 64-bit block size, which may be a limitation for large data.
- **Key Handling**: The password is used directly as the key (padded/truncated to the required length). For production use, consider a proper key derivation function (e.g., PBKDF2).
- **Storage**: No data is stored; the password and message are processed in memory.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contributing
Feel free to open issues or submit pull requests on GitHub if you have suggestions or improvements!
