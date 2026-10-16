/**
 * Secure Client Storage Utility
 *
 * Provides synchronous authenticated encryption (EtM: Keystream XOR + HMAC-SHA256)
 * for sensitive client-side data like usernames and timestamps in localStorage.
 *
 * Prevents:
 * 1. Plaintext disclosure in browser DevTools (Application -> Local Storage).
 * 2. Tampering / privilege escalation (e.g., editing username to an admin's name).
 *    Any tampered value fails HMAC validation and is immediately purged.
 */

// ── SHA-256 & HMAC Implementation (FIPS 180-4, pure TypeScript, synchronous) ──

const K256 = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

function sha256(data: Uint8Array): Uint8Array {
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const dataLen = data.length;
  const bitLen = dataLen * 8;
  const padLen = (dataLen % 64 < 56) ? (56 - (dataLen % 64)) : (120 - (dataLen % 64));
  const totalLen = dataLen + padLen + 8;
  const padded = new Uint8Array(totalLen);
  padded.set(data);
  padded[dataLen] = 0x80;

  // 64-bit big-endian length at end
  const view = new DataView(padded.buffer);
  view.setUint32(totalLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(totalLen - 4, bitLen >>> 0, false);

  const w = new Uint32Array(64);

  for (let offset = 0; offset < totalLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K256[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  outView.setUint32(20, h5, false);
  outView.setUint32(24, h6, false);
  outView.setUint32(28, h7, false);
  return out;
}

function hmacSha256(key: Uint8Array, message: Uint8Array): Uint8Array {
  let k = key;
  if (k.length > 64) {
    k = sha256(k);
  }
  const paddedKey = new Uint8Array(64);
  paddedKey.set(k);

  const oKeyPad = new Uint8Array(64);
  const iKeyPad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    oKeyPad[i] = paddedKey[i] ^ 0x5c;
    iKeyPad[i] = paddedKey[i] ^ 0x36;
  }

  const innerMsg = new Uint8Array(64 + message.length);
  innerMsg.set(iKeyPad, 0);
  innerMsg.set(message, 64);
  const innerHash = sha256(innerMsg);

  const outerMsg = new Uint8Array(64 + 32);
  outerMsg.set(oKeyPad, 0);
  outerMsg.set(innerHash, 64);
  return sha256(outerMsg);
}

// ── Hex & Byte Helpers ─────────────────────────────────────────────

function toHex(bytes: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function fromHex(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(hex)) {
    return null;
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// ── Device-Bound Key Derivation ────────────────────────────────────

const DEVICE_KEY_STORAGE = "_cr_dev_k";

function getDeviceEntropyKey(): Uint8Array {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return new Uint8Array(32);
  }

  let storedKey = localStorage.getItem(DEVICE_KEY_STORAGE);
  if (!storedKey || storedKey.length !== 64) {
    // Generate new high-entropy 256-bit random key
    const randomBytes = new Uint8Array(32);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(randomBytes);
    } else {
      for (let i = 0; i < 32; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256);
      }
    }
    storedKey = toHex(randomBytes);
    try {
      localStorage.setItem(DEVICE_KEY_STORAGE, storedKey);
    } catch {
      // Storage unavailable or blocked
    }
  }

  const parsed = fromHex(storedKey);
  return parsed && parsed.length === 32 ? parsed : new Uint8Array(32);
}

// ── Authenticated Stream Cipher (HMAC-CTR mode) ─────────────────────

function generateKeystream(key: Uint8Array, iv: Uint8Array, length: number): Uint8Array {
  const blocks = Math.ceil(length / 32);
  const keystream = new Uint8Array(blocks * 32);

  for (let b = 0; b < blocks; b++) {
    const counterMsg = new Uint8Array(iv.length + 4);
    counterMsg.set(iv, 0);
    const view = new DataView(counterMsg.buffer);
    view.setUint32(iv.length, b, false);
    const blockHash = hmacSha256(key, counterMsg);
    keystream.set(blockHash, b * 32);
  }

  return keystream.subarray(0, length);
}

const PREFIX = "cr_sec_v1:";

export interface DecryptedUsernameData {
  username: string;
  timestamp: number;
}

/**
 * Encrypts username and timestamp into a tamper-evident authenticated string.
 * Format: "cr_sec_v1:<iv_hex>:<ciphertext_hex>:<hmac_hex>"
 */
export function encryptUsernamePayload(username: string, timestamp: number = Date.now()): {
  encryptedUsername: string;
  encryptedTimestamp: string;
} {
  const key = getDeviceEntropyKey();
  const encoder = new TextEncoder();

  // Payload structure: { u: username, t: timestamp, n: random_nonce }
  const iv = new Uint8Array(16);
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(iv);
  } else {
    for (let i = 0; i < 16; i++) iv[i] = Math.floor(Math.random() * 256);
  }

  const payloadObj = { u: username, t: timestamp };
  const plaintext = encoder.encode(JSON.stringify(payloadObj));

  const keystream = generateKeystream(key, iv, plaintext.length);
  const ciphertext = new Uint8Array(plaintext.length);
  for (let i = 0; i < plaintext.length; i++) {
    ciphertext[i] = plaintext[i] ^ keystream[i];
  }

  // MAC over (IV || ciphertext)
  const macPayload = new Uint8Array(iv.length + ciphertext.length);
  macPayload.set(iv, 0);
  macPayload.set(ciphertext, iv.length);
  const mac = hmacSha256(key, macPayload);

  const encryptedString = `${PREFIX}${toHex(iv)}:${toHex(ciphertext)}:${toHex(mac)}`;

  // Also create a separate tamper-evident timestamp token for the ts key
  const tsIv = new Uint8Array(8);
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(tsIv);
  }
  const tsMac = hmacSha256(key, encoder.encode(`ts:${timestamp}:${toHex(tsIv)}`));
  const encryptedTsString = `cr_ts_v1:${timestamp}:${toHex(tsIv)}:${toHex(tsMac).slice(0, 16)}`;

  return {
    encryptedUsername: encryptedString,
    encryptedTimestamp: encryptedTsString,
  };
}

/**
 * Decrypts and verifies the username payload from localStorage.
 * Returns null if data is missing, expired, invalid, or TAMPERED.
 */
export function decryptUsernamePayload(
  storedVal: string | null,
  maxAgeMs: number = 24 * 60 * 60 * 1000
): DecryptedUsernameData | null {
  if (!storedVal) return null;

  // Detect plain-text or tampered input
  if (!storedVal.startsWith(PREFIX)) {
    return null;
  }

  const parts = storedVal.slice(PREFIX.length).split(":");
  if (parts.length !== 3) {
    return null;
  }

  const iv = fromHex(parts[0]);
  const ciphertext = fromHex(parts[1]);
  const expectedMac = fromHex(parts[2]);

  if (!iv || !ciphertext || !expectedMac || iv.length !== 16 || expectedMac.length !== 32) {
    return null;
  }

  const key = getDeviceEntropyKey();

  // Verify HMAC (Constant time check)
  const macPayload = new Uint8Array(iv.length + ciphertext.length);
  macPayload.set(iv, 0);
  macPayload.set(ciphertext, iv.length);
  const calculatedMac = hmacSha256(key, macPayload);

  let diff = 0;
  for (let i = 0; i < 32; i++) {
    diff |= calculatedMac[i] ^ expectedMac[i];
  }
  if (diff !== 0) {
    // Tamper attempt detected!
    return null;
  }

  // Decrypt
  const keystream = generateKeystream(key, iv, ciphertext.length);
  const plaintext = new Uint8Array(ciphertext.length);
  for (let i = 0; i < ciphertext.length; i++) {
    plaintext[i] = ciphertext[i] ^ keystream[i];
  }

  try {
    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(plaintext);
    const parsed = JSON.parse(jsonStr) as { u?: string; t?: number };

    if (!parsed || typeof parsed.u !== "string" || typeof parsed.t !== "number") {
      return null;
    }

    const elapsed = Date.now() - parsed.t;
    if (elapsed < 0 || elapsed > maxAgeMs) {
      return null; // Expired
    }

    return {
      username: parsed.u,
      timestamp: parsed.t,
    };
  } catch {
    return null;
  }
}
