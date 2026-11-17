/**
 * Client-side AES-256-GCM encryption/decryption using Web Crypto API.
 * Files are encrypted in the browser before upload and decrypted after download.
 * The encryption key is derived from the room password using PBKDF2.
 */

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 100000;

// Ephemeral in-memory key cache to prevent repeated 100,000 PBKDF2 iterations
// Keyed by password + hex(salt)
const keyCache = new Map<string, CryptoKey>();

function getSaltHex(salt: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < salt.length; i++) {
    hex += salt[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * Derive an AES-256-GCM key from a password using PBKDF2.
 * Caches derived keys so identical salt+password lookups (e.g. previewing, downloading,
 * multi-file operations) do not freeze the UI with redundant PBKDF2 iterations.
 */
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const cacheKey = `${password}:${getSaltHex(salt)}`;
  const cached = keyCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const derived = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );

  // Cache up to 100 derived keys to prevent memory leaks
  if (keyCache.size > 100) {
    const firstKey = keyCache.keys().next().value;
    if (firstKey) keyCache.delete(firstKey);
  }
  keyCache.set(cacheKey, derived);

  return derived;
}

/**
 * Encrypt a file's ArrayBuffer using AES-256-GCM.
 * Returns: [salt (16 bytes) | iv (12 bytes) | ciphertext]
 */
export async function encryptFile(
  data: ArrayBuffer,
  password: string
): Promise<ArrayBuffer> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    data
  );

  // Concatenate: salt + iv + ciphertext
  const result = new Uint8Array(
    SALT_LENGTH + IV_LENGTH + ciphertext.byteLength
  );
  result.set(salt, 0);
  result.set(iv, SALT_LENGTH);
  result.set(new Uint8Array(ciphertext), SALT_LENGTH + IV_LENGTH);

  return result.buffer as ArrayBuffer;
}

/**
 * Decrypt a file's ArrayBuffer using AES-256-GCM.
 * Expects: [salt (16 bytes) | iv (12 bytes) | ciphertext]
 */
export async function decryptFile(
  encryptedData: ArrayBuffer,
  password: string
): Promise<ArrayBuffer> {
  const data = new Uint8Array(encryptedData);

  const salt = data.slice(0, SALT_LENGTH);
  const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = data.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(password, salt);

  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    ciphertext.buffer as ArrayBuffer
  );
}
