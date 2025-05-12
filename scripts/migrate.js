// Direct database migration script
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from 'ws';

// Required for Neon database connection
neonConfig.webSocketConstructor = ws;

async function main() {
  console.log('Starting database migration...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  
  // Create a database pool and Drizzle instance
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  
  console.log('Running migrations...');
  
  try {
    // Create tables directly without schema files
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        guest_id TEXT,
        is_guest BOOLEAN DEFAULT FALSE
      );
      
      CREATE TABLE IF NOT EXISTS transformations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        guest_id TEXT,
        original_text TEXT NOT NULL,
        transformed_text TEXT NOT NULL,
        from_style TEXT NOT NULL,
        to_style TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS guest_sessions (
        id SERIAL PRIMARY KEY,
        guest_id TEXT NOT NULL UNIQUE,
        usage_count INTEGER DEFAULT 0,
        max_usage INTEGER DEFAULT 10,
        created_at TEXT NOT NULL
      );
    `);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration script failed:', err);
    process.exit(1);
  });