// Script to push the admin schema to the database
import { neonConfig, Client } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

// Configure Neon for WebSocket
neonConfig.webSocketConstructor = ws;

// Check for database URL
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function main() {
  try {
    console.log('Connecting to database...');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    const db = drizzle(client);
    
    console.log('Creating admin tables...');
    
    // Create users table if it doesn't exist (needed for references)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT,
        password TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP,
        role TEXT,
        is_premium BOOLEAN DEFAULT FALSE,
        premium_tier TEXT,
        premium_expires_at TIMESTAMP,
        mfa_enabled BOOLEAN DEFAULT FALSE,
        mfa_secret TEXT,
        token_balance INTEGER DEFAULT 0,
        status TEXT DEFAULT 'ACTIVE',
        ban_reason TEXT,
        ban_expires_at TIMESTAMP
      );
    `);
    
    // Create user_journals table if it doesn't exist (referenced in admin service)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_journals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        emotion TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        is_public BOOLEAN DEFAULT FALSE
      );
    `);
    
    // Create tokens table if it doesn't exist (referenced in admin service)
    await client.query(`
      CREATE TABLE IF NOT EXISTS tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        amount INTEGER NOT NULL,
        transaction_type TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create nft_items table if it doesn't exist (referenced in admin service)
    await client.query(`
      CREATE TABLE IF NOT EXISTS nft_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        description TEXT,
        emotion TEXT NOT NULL,
        image_url TEXT,
        minted_at TIMESTAMP DEFAULT NOW(),
        rarity TEXT,
        external_url TEXT
      );
    `);
    
    // Create adminUsers table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        permissions JSONB,
        avatar_url TEXT,
        contact_phone TEXT,
        department TEXT
      );
    `);
    
    // Create admin_action_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_action_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES admin_users(id),
        admin_username TEXT NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        details TEXT,
        ip_address TEXT NOT NULL,
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create flagged_contents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS flagged_contents (
        id SERIAL PRIMARY KEY,
        content_type TEXT NOT NULL,
        content_id INTEGER NOT NULL,
        reported_by INTEGER REFERENCES users(id),
        reason TEXT NOT NULL,
        details TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT NOW(),
        moderated_by INTEGER REFERENCES admin_users(id),
        moderated_at TIMESTAMP,
        admin_notes TEXT
      );
    `);
    
    // Create user_bans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_bans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        ban_type TEXT NOT NULL,
        reason TEXT NOT NULL,
        details TEXT,
        banned_by INTEGER NOT NULL REFERENCES admin_users(id),
        banned_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        ip_address TEXT,
        device_fingerprint TEXT
      );
    `);
    
    // Create system_health_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_health_logs (
        id SERIAL PRIMARY KEY,
        area TEXT NOT NULL,
        metric TEXT NOT NULL,
        value TEXT NOT NULL,
        status TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        details JSONB
      );
    `);
    
    // Create token_rate_adjustments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS token_rate_adjustments (
        id SERIAL PRIMARY KEY,
        activity_type TEXT NOT NULL,
        old_rate NUMERIC NOT NULL,
        new_rate NUMERIC NOT NULL,
        reason TEXT NOT NULL,
        adjusted_by INTEGER NOT NULL REFERENCES admin_users(id),
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create token_pool_splits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS token_pool_splits (
        id SERIAL PRIMARY KEY,
        total_amount NUMERIC NOT NULL,
        contributor_count INTEGER NOT NULL,
        donation_percentage NUMERIC NOT NULL,
        donation_amount NUMERIC NOT NULL,
        distribution_amount NUMERIC NOT NULL,
        initiated_by INTEGER NOT NULL REFERENCES admin_users(id),
        timestamp TIMESTAMP DEFAULT NOW(),
        status TEXT NOT NULL DEFAULT 'PENDING',
        completed_at TIMESTAMP,
        details JSONB
      );
    `);
    
    // Create token_pool_split_recipients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS token_pool_split_recipients (
        id SERIAL PRIMARY KEY,
        split_id INTEGER NOT NULL REFERENCES token_pool_splits(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        current_balance NUMERIC NOT NULL,
        proportion NUMERIC NOT NULL,
        tokens_awarded NUMERIC NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create system_backups table
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_backups (
        id SERIAL PRIMARY KEY,
        backup_type TEXT NOT NULL,
        destination TEXT NOT NULL,
        initiated_by INTEGER REFERENCES admin_users(id),
        initiated_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'PENDING',
        file_size NUMERIC,
        backup_id TEXT NOT NULL,
        encryption_status TEXT NOT NULL DEFAULT 'ENCRYPTED',
        storage_location TEXT NOT NULL,
        retention_period INTEGER
      );
    `);
    
    // Create api_metrics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_metrics (
        id SERIAL PRIMARY KEY,
        endpoint TEXT NOT NULL,
        method TEXT NOT NULL,
        response_time NUMERIC NOT NULL,
        status_code INTEGER NOT NULL,
        ip_address TEXT,
        user_id INTEGER REFERENCES users(id),
        timestamp TIMESTAMP DEFAULT NOW(),
        request_size NUMERIC,
        response_size NUMERIC,
        user_agent TEXT
      );
    `);
    
    // Insert default admin user if it doesn't exist
    await client.query(`
      INSERT INTO admin_users (username, email, password, role, is_active)
      VALUES ('admin', 'admin@moodsync.com', 'password', 'admin', true)
      ON CONFLICT (username) DO NOTHING;
    `);

    console.log('Admin schema pushed successfully');
    await client.end();
  } catch (error) {
    console.error('Error pushing admin schema:', error);
    process.exit(1);
  }
}

main();