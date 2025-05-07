/**
 * Enhanced Encryption Module for MoodSync
 * 
 * This client-side module provides encryption capabilities for sensitive data
 * before it is sent to the server. Used in conjunction with server-side encryption
 * to provide end-to-end encryption for highly sensitive user data.
 */

// We're using the Web Crypto API for client-side encryption
// This is more secure than implementing our own crypto in JS

/**
 * Generate a random encryption key
 * @returns A Uint8Array containing the key
 */
export async function generateKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt'] // key usages
  );
}

/**
 * Export a CryptoKey to raw bytes
 * @param key The CryptoKey to export
 * @returns A Uint8Array containing the raw key
 */
export async function exportKey(key: CryptoKey): Promise<Uint8Array> {
  const rawKey = await window.crypto.subtle.exportKey('raw', key);
  return new Uint8Array(rawKey);
}

/**
 * Import a raw key as a CryptoKey
 * @param rawKey The raw key as a Uint8Array
 * @returns A CryptoKey
 */
export async function importKey(rawKey: Uint8Array): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    'raw',
    rawKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt'] // key usages
  );
}

/**
 * Convert a hex string to a Uint8Array
 * @param hex The hex string
 * @returns A Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Convert a Uint8Array to a hex string
 * @param bytes The Uint8Array
 * @returns A hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Encrypt text using AES-GCM
 * @param text The plaintext to encrypt
 * @param key The encryption key
 * @returns An object containing the encrypted data, IV, and auth tag
 */
export async function encryptText(text: string, key: CryptoKey): Promise<string> {
  // Generate a random IV (initialization vector)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the text
  const encodedText = new TextEncoder().encode(text);
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128,
    },
    key,
    encodedText
  );
  
  // Combine the IV and encrypted data
  const encryptedArray = new Uint8Array(iv.length + encryptedData.byteLength);
  encryptedArray.set(iv);
  encryptedArray.set(new Uint8Array(encryptedData), iv.length);
  
  // Return as hex string
  return bytesToHex(encryptedArray);
}

/**
 * Decrypt text that was encrypted with AES-GCM
 * @param encryptedText The encrypted text as a hex string
 * @param key The decryption key
 * @returns The decrypted plaintext
 */
export async function decryptText(encryptedText: string, key: CryptoKey): Promise<string> {
  try {
    // Convert hex to bytes
    const encryptedBytes = hexToBytes(encryptedText);
    
    // Extract the IV and encrypted data
    const iv = encryptedBytes.slice(0, 12);
    const encryptedData = encryptedBytes.slice(12);
    
    // Decrypt the data
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: 128,
      },
      key,
      encryptedData
    );
    
    // Decode and return
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

/**
 * Create a secure hash of text using SHA-256
 * @param text The text to hash
 * @returns The hash as a hex string
 */
export async function hashText(text: string): Promise<string> {
  const encodedText = new TextEncoder().encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', encodedText);
  return bytesToHex(new Uint8Array(hashBuffer));
}

/**
 * Symmetrically encrypt data with a password
 * This can be used for data that needs to be encrypted/decrypted
 * with a user-provided password
 * 
 * @param text The text to encrypt
 * @param password The password
 * @returns The encrypted text
 */
export async function encryptWithPassword(text: string, password: string): Promise<string> {
  // Derive a key from the password
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  // Encrypt the text
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128,
    },
    key,
    encoder.encode(text)
  );
  
  // Combine the salt, IV, and encrypted data
  const result = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
  result.set(salt);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encryptedData), salt.length + iv.length);
  
  return bytesToHex(result);
}

/**
 * Decrypt text that was encrypted with a password
 * 
 * @param encryptedText The encrypted text
 * @param password The password
 * @returns The decrypted text
 */
export async function decryptWithPassword(encryptedText: string, password: string): Promise<string> {
  try {
    const encryptedBytes = hexToBytes(encryptedText);
    
    // Extract the salt, IV, and encrypted data
    const salt = encryptedBytes.slice(0, 16);
    const iv = encryptedBytes.slice(16, 28);
    const encryptedData = encryptedBytes.slice(28);
    
    // Derive the key from the password
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // Decrypt the data
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: 128,
      },
      key,
      encryptedData
    );
    
    // Decode and return
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}