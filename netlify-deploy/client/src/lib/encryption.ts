import CryptoJS from 'crypto-js';

// Secret key for client-side encryption - this should ideally be per user and securely managed
// For a production app, consider using a key derived from user credentials or provided from server
const DEFAULT_SECRET_KEY = 'MoodSyncSecureEncryptionKey2024!';

/**
 * Encrypts a message using AES encryption
 * 
 * @param message - The plaintext message to encrypt
 * @param secretKey - Optional custom secret key (defaults to the app's default key)
 * @returns The encrypted message as a string
 */
export function encryptMessage(message: string, secretKey: string = DEFAULT_SECRET_KEY): string {
  try {
    return CryptoJS.AES.encrypt(message, secretKey).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    return message; // Fallback to original message to prevent data loss in case of encryption failure
  }
}

/**
 * Decrypts an AES encrypted message
 * 
 * @param encryptedMessage - The encrypted message to decrypt
 * @param secretKey - Optional custom secret key (defaults to the app's default key)
 * @returns The decrypted message as a string
 */
export function decryptMessage(encryptedMessage: string, secretKey: string = DEFAULT_SECRET_KEY): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedMessage; // Return original encrypted message if decryption fails
  }
}

/**
 * Determines if a message appears to be encrypted
 * This is a heuristic check based on the characteristics of encrypted messages
 * 
 * @param message - The message to check
 * @returns True if the message appears to be encrypted
 */
export function isEncryptedMessage(message: string): boolean {
  // Basic check: encrypted messages with AES by CryptoJS usually start with "U2FsdGVk"
  // and contain only base64 characters
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  return message.startsWith('U2FsdGVk') && base64Regex.test(message);
}

/**
 * Handles a message that may or may not be encrypted
 * If it's already encrypted, return it as is
 * If it's not encrypted, encrypt it
 * 
 * @param message - The message to handle
 * @param secretKey - Optional custom secret key
 * @returns The encrypted message
 */
export function ensureEncrypted(message: string, secretKey: string = DEFAULT_SECRET_KEY): string {
  if (isEncryptedMessage(message)) {
    return message;
  }
  return encryptMessage(message, secretKey);
}

/**
 * Attempts to decrypt a message that may or may not be encrypted
 * If it seems encrypted, decrypt it
 * If it doesn't seem encrypted, return it as is
 * 
 * @param message - The message to handle
 * @param secretKey - Optional custom secret key
 * @returns The decrypted message or original message if not encrypted
 */
export function safeDecrypt(message: string, secretKey: string = DEFAULT_SECRET_KEY): string {
  if (isEncryptedMessage(message)) {
    return decryptMessage(message, secretKey);
  }
  return message;
}

/**
 * Creates a room-specific encryption key by combining the app's default key with the room ID
 * This provides a unique key for each chat room
 * 
 * @param roomId - The chat room ID
 * @returns A room-specific encryption key
 */
export function getRoomSpecificKey(roomId: number | string): string {
  return `${DEFAULT_SECRET_KEY}-Room-${roomId}`;
}

/**
 * Gets a user-specific encryption key by combining the app's default key with the user ID
 * This provides a unique key for each user's private data
 * 
 * @param userId - The user ID
 * @returns A user-specific encryption key
 */
export function getUserSpecificKey(userId: number | string): string {
  return `${DEFAULT_SECRET_KEY}-User-${userId}`;
}