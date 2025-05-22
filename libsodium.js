(function(global) {
  var sodium = { version: '0.7.0' };
  sodium.crypto_stream_chacha20_xor = function(message, nonce, key) {
    if (!(message instanceof Uint8Array) || !(nonce instanceof Uint8Array) || !(key instanceof Uint8Array)) {
      throw new TypeError('Arguments must be Uint8Array');
    }
    if (key.length !== 32) throw new Error('Key must be 32 bytes');
    if (nonce.length !== 8) throw new Error('Nonce must be 8 bytes');

    const output = new Uint8Array(message.length);
    let state = new Uint32Array(16);
    state[0] = 0x61707865; state[1] = 0x3320646e; state[2] = 0x79622d32; state[3] = 0x6b206574;
    for (let i = 0; i < 8; i++) state[4 + i] = (key[i * 4] | (key[i * 4 + 1] << 8) | (key[i * 4 + 2] << 16) | (key[i * 4 + 3] << 24));
    state[12] = 0; state[13] = 0;
    state[14] = (nonce[0] | (nonce[1] << 8) | (nonce[2] << 16) | (nonce[3] << 24));
    state[15] = (nonce[4] | (nonce[5] << 8) | (nonce[6] << 16) | (nonce[7] << 24));

    let block = new Uint8Array(64);
    for (let i = 0; i < message.length; i += 64) {
      const blockSize = Math.min(64, message.length - i);
      chacha20_block(state, block);
      for (let j = 0; j < blockSize; j++) output[i + j] = message[i + j] ^ block[j];
      state[12]++;
    }
    return output;
  };

  function chacha20_block(state, out) {
    let x = new Uint32Array(state);
    for (let i = 0; i < 10; i++) {
      quarterRound(x, 0, 4, 8, 12); quarterRound(x, 1, 5, 9, 13);
      quarterRound(x, 2, 6, 10, 14); quarterRound(x, 3, 7, 11, 15);
      quarterRound(x, 0, 5, 10, 15); quarterRound(x, 1, 6, 11, 12);
      quarterRound(x, 2, 7, 8, 13); quarterRound(x, 3, 4, 9, 14);
    }
    for (let i = 0; i < 16; i++) x[i] = (x[i] + state[i]) >>> 0;
    for (let i = 0; i < 16; i++) {
      out[i * 4] = x[i] & 0xff;
      out[i * 4 + 1] = (x[i] >>> 8) & 0xff;
      out[i * 4 + 2] = (x[i] >>> 16) & 0xff;
      out[i * 4 + 3] = (x[i] >>> 24) & 0xff;
    }
  }

  function quarterRound(x, a, b, c, d) {
    x[a] = (x[a] + x[b]) >>> 0; x[d] = rotl32(x[d] ^ x[a], 16);
    x[c] = (x[c] + x[d]) >>> 0; x[b] = rotl32(x[b] ^ x[c], 12);
    x[a] = (x[a] + x[b]) >>> 0; x[d] = rotl32(x[d] ^ x[a], 8);
    x[c] = (x[c] + x[d]) >>> 0; x[b] = rotl32(x[b] ^ x[c], 7);
  }

  function rotl32(x, n) {
    return ((x << n) | (x >>> (32 - n))) >>> 0;
  }

  sodium.onload = function() {};
  global.sodium = sodium;
})(typeof window !== 'undefined' ? window : this);
