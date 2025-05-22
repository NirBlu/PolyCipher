console.log('popup.js loaded');

document.getElementById('cipher-form').addEventListener('submit', async function(e) {
  console.log('Form submitted');
  e.preventDefault();

  const cipher = document.getElementById('cipher').value;
  const password = document.getElementById('password').value;
  let message = document.getElementById('message').value;
  const action = document.querySelector('input[name="action"]:checked').value;
  const resultDiv = document.getElementById('result');
  const copyBtn = document.getElementById('copy-btn');

  try {
    let result;
    if (cipher === 'blowfish') {
      result = await processBlowfish(password, message, action);
    } else if (cipher === 'aes') {
      result = await processAES(password, message, action);
    } else if (cipher === 'chacha') {
      if (typeof sodium.crypto_stream_chacha20_xor !== 'function') {
        throw new Error('ChaCha support is not available. Ensure libsodium.js is loaded correctly.');
      }
      result = await processChaCha(password, message, action);
    } else if (cipher === 'twofish') {
      if (typeof window.Twofish !== 'function') {
        throw new Error('Twofish is not defined. Ensure twofish.js is loaded correctly.');
      }
      result = await processTwofish(password, message, action);
    }

    resultDiv.textContent = (action === 'encode' ? 'Encoded: ' : 'Decoded: ') + result;
    resultDiv.style.color = 'black';
    copyBtn.style.display = 'inline-block'; // Show copy button
  } catch (error) {
    console.error('Processing error:', error);
    resultDiv.textContent = 'Error: ' + error.message;
    resultDiv.style.color = 'red';
    copyBtn.style.display = 'none'; // Hide copy button on error
  }
});

// Copy button functionality
document.getElementById('copy-btn').addEventListener('click', function() {
  console.log('Copy button clicked');
  const resultDiv = document.getElementById('result');
  const textToCopy = resultDiv.textContent.startsWith('Encoded: ') || resultDiv.textContent.startsWith('Decoded: ')
    ? resultDiv.textContent.split(': ')[1]
    : resultDiv.textContent;

  navigator.clipboard.writeText(textToCopy).then(() => {
    alert('Copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy to clipboard.');
  });
});

// Blowfish processing
async function processBlowfish(password, message, action) {
  const bf = new Blowfish(password);
  if (action === 'encode') {
    const encoded = bf.encrypt(message);
    return btoa(String.fromCharCode(...encoded));
  } else {
    const binary = atob(message).split('').map(c => c.charCodeAt(0));
    return bf.decrypt(new Uint8Array(binary));
  }
}

// AES processing using Web Crypto API
async function processAES(password, message, action) {
  const enc = new TextEncoder();
  const encodedKey = enc.encode(password.padEnd(32, ' ')).slice(0, 32); // 256-bit key
  const cryptoKey = await crypto.subtle.importKey("raw", encodedKey, "AES-CBC", true, ["encrypt", "decrypt"]);

  if (action === 'encode') {
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, cryptoKey, enc.encode(message));
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  } else {
    const binary = atob(message).split('').map(c => c.charCodeAt(0));
    const data = new Uint8Array(binary);
    const iv = data.slice(0, 16);
    const ciphertext = data.slice(16);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, cryptoKey, ciphertext);
    return new TextDecoder().decode(decrypted);
  }
}

// ChaCha processing using libsodium.js
async function processChaCha(password, message, action) {
  const enc = new TextEncoder();
  const key = enc.encode(password.padEnd(32, ' ')).slice(0, 32); // 256-bit key
  const nonce = crypto.getRandomValues(new Uint8Array(8)); // 64-bit nonce

  if (action === 'encode') {
    const encrypted = sodium.crypto_stream_chacha20_xor(enc.encode(message), nonce, key);
    const combined = new Uint8Array(nonce.length + encrypted.length);
    combined.set(nonce);
    combined.set(encrypted, nonce.length);
    return btoa(String.fromCharCode(...combined));
  } else {
    const binary = atob(message).split('').map(c => c.charCodeAt(0));
    const data = new Uint8Array(binary);
    const nonce = data.slice(0, 8);
    const ciphertext = data.slice(8);
    const decrypted = sodium.crypto_stream_chacha20_xor(ciphertext, nonce, key);
    return new TextDecoder().decode(decrypted);
  }
}

// Twofish processing
async function processTwofish(password, message, action) {
  const enc = new TextEncoder();
  const key = enc.encode(password.padEnd(32, ' ')).slice(0, 32); // 256-bit key
  const twofish = new window.Twofish();
  twofish.init(key);

  if (action === 'encode') {
    const padded = new Uint8Array(Math.ceil(message.length / 16) * 16);
    padded.set(enc.encode(message));
    for (let i = message.length; i < padded.length; i++) padded[i] = 0;
    const encrypted = twofish.encrypt(padded);
    return btoa(String.fromCharCode(...encrypted));
  } else {
    const binary = atob(message).split('').map(c => c.charCodeAt(0));
    const decrypted = twofish.decrypt(new Uint8Array(binary));
    return new TextDecoder().decode(decrypted).replace(/\0+$/, '');
  }
}
