// This script will use the exact same algorithm as the auth.ts file to generate a valid password hash
import crypto from 'crypto';
import util from 'util';

// Recreate the same function from auth.ts
const scryptAsync = util.promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

// Create hash for password "aaaaaa"
async function main() {
  const hashedPassword = await hashPassword('aaaaaa');
  console.log('Hash for "aaaaaa":', hashedPassword);
}

main().catch(console.error);