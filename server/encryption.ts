/**
 * MoodLync Encryption Utilities
 * 
 * This module implements AES-256-GCM encryption for sensitive data, 
 * along with SHA-256 hashing and other cryptographic functions.
 */

import crypto from 'crypto';

// Encryption settings
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'moodlync_dev_key_please_change_in_production';
const IV_LENGTH = 16; // For AES, this is always 16 bytes
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt a text string using AES-256-GCM
 * 
 * @param text - The plaintext to encrypt
 * @returns The encrypted text (hex-encoded)
 */
export function encryptText(text: string): string {
  if (!text) return '';
  
  // Generate a random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Create cipher with key, iv, and specify auth tag length
  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM, 
    Buffer.from(ENCRYPTION_KEY), 
    iv,
    { authTagLength: AUTH_TAG_LENGTH }
  );
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get the authentication tag
  const authTag = cipher.getAuthTag();
  
  // Format: iv + authTag + encrypted
  return iv.toString('hex') + 
         authTag.toString('hex') + 
         encrypted;
}

/**
 * Decrypt a text string that was encrypted with encryptText
 * 
 * @param encryptedText - The encrypted text (hex-encoded)
 * @returns The decrypted plaintext
 */
export function decryptText(encryptedText: string): string {
  if (!encryptedText) return '';
  
  try {
    // Extract the IV, auth tag, and encrypted text
    const iv = Buffer.from(encryptedText.substring(0, IV_LENGTH * 2), 'hex');
    const authTag = Buffer.from(encryptedText.substring(IV_LENGTH * 2, IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2), 'hex');
    const encrypted = encryptedText.substring(IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM, 
      Buffer.from(ENCRYPTION_KEY), 
      iv,
      { authTagLength: AUTH_TAG_LENGTH }
    );
    
    // Set auth tag
    decipher.setAuthTag(authTag);
    
    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

/**
 * Hash a text string using SHA-256
 * 
 * @param text - The text to hash
 * @returns The hashed text (hex-encoded)
 */
export function hashText(text: string): string {
  if (!text) return '';
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Generate a random token
 * 
 * @param length - The length of the token in bytes
 * @returns The random token (hex-encoded)
 */
export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Create a hash-based message authentication code (HMAC)
 * 
 * @param text - The text to authenticate
 * @param key - The key to use for authentication
 * @returns The HMAC (hex-encoded)
 */
export function createHmac(text: string, key: string): string {
  if (!text || !key) return '';
  return crypto.createHmac('sha256', key).update(text).digest('hex');
}

/**
 * Verify a hash-based message authentication code (HMAC)
 * 
 * @param text - The text to authenticate
 * @param key - The key used for authentication
 * @param hmac - The HMAC to verify
 * @returns Whether the HMAC is valid
 */
export function verifyHmac(text: string, key: string, hmac: string): boolean {
  if (!text || !key || !hmac) return false;
  const expectedHmac = createHmac(text, key);
  return crypto.timingSafeEqual(
    Buffer.from(expectedHmac, 'hex'),
    Buffer.from(hmac, 'hex')
  );
}