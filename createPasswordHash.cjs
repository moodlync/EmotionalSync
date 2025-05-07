// This script will use the exact same algorithm as the auth.ts file to generate a valid password hash
const crypto = require('crypto');
const util = require('util');

// Recreate the same function from auth.ts
const scryptAsync = util.promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

// Create hash for password "Queanbeyan@9"
async function main() {
  const hashedPassword = await hashPassword('Queanbeyan@9');
  console.log('Hash for "Queanbeyan@9":', hashedPassword);
}

main().catch(console.error);