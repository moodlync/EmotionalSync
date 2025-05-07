import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import crypto from 'crypto';

// Generate a new secret for the user
export function generateSecret(username: string) {
  return speakeasy.generateSecret({
    name: `MoodLync:${username}`,
    length: 20
  });
}

// Generate backup codes for a user
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate a random 10-character alphanumeric code
    const code = crypto.randomBytes(5).toString('hex').toUpperCase();
    // Format as XXXX-XXXX-XXXX (easier to read)
    codes.push(code.slice(0, 4) + '-' + code.slice(4, 8) + '-' + code.slice(8));
  }
  return codes;
}

// Generate a recovery key for the user
export function generateRecoveryKey(): string {
  // Generate a 24-character alphanumeric recovery key
  const key = crypto.randomBytes(18).toString('hex').toUpperCase();
  // Format as XXXX-XXXX-XXXX-XXXX-XXXX-XXXX for readability
  return key.match(/.{1,4}/g)?.join('-') || key;
}

// Verify a token against a secret
export function verifyToken(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1  // Allow 1 step skew (30 seconds)
  });
}

// Generate a QR code for the secret
export async function generateQRCode(secretBase32: string, username: string): Promise<string> {
  const otpauth = speakeasy.otpauthURL({
    secret: secretBase32,
    label: `MoodLync:${username}`,
    issuer: 'MoodLync',
    encoding: 'base32'
  });
  
  return new Promise((resolve, reject) => {
    qrcode.toDataURL(otpauth, (err, dataUrl) => {
      if (err) {
        reject(err);
      } else {
        resolve(dataUrl);
      }
    });
  });
}

// Verify a backup code against stored backup codes
export function verifyBackupCode(enteredCode: string, storedCodes: string[]): { valid: boolean, remainingCodes: string[] } {
  // Normalize the entered code by removing any dashes
  const normalizedEnteredCode = enteredCode.replace(/-/g, '').toUpperCase();
  
  // Find if there's a matching backup code (after normalizing stored codes as well)
  const matchIndex = storedCodes.findIndex(code => 
    code.replace(/-/g, '').toUpperCase() === normalizedEnteredCode
  );
  
  if (matchIndex !== -1) {
    // Create a new array without the used code
    const remainingCodes = [...storedCodes];
    remainingCodes.splice(matchIndex, 1);
    return { valid: true, remainingCodes };
  }
  
  return { valid: false, remainingCodes: storedCodes };
}

// Verify a recovery key
export function verifyRecoveryKey(enteredKey: string, storedKey: string): boolean {
  // Normalize both keys by removing dashes and converting to uppercase
  const normalizedEnteredKey = enteredKey.replace(/-/g, '').toUpperCase();
  const normalizedStoredKey = storedKey.replace(/-/g, '').toUpperCase();
  
  return normalizedEnteredKey === normalizedStoredKey;
}

// Create a 2FA setup object with everything the user needs
export interface TwoFactorSetup {
  secret: {
    ascii: string;
    hex: string;
    base32: string;
    otpauth_url: string;
  };
  backupCodes: string[];
  recoveryKey: string;
  qrCodeUrl: string;
}

// Generate a complete 2FA setup for a user
export async function generateTwoFactorSetup(username: string): Promise<TwoFactorSetup> {
  const secret = generateSecret(username);
  const backupCodes = generateBackupCodes(10);
  const recoveryKey = generateRecoveryKey();
  const qrCodeUrl = await generateQRCode(secret.base32, username);
  
  return {
    secret,
    backupCodes,
    recoveryKey,
    qrCodeUrl
  };
}