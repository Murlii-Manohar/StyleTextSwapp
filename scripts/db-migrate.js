// Database migration script for Text Style Transfer application
// This script creates all necessary database tables for the application

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Required for Neon database connection
neonConfig.webSocketConstructor = ws;

async function main() {
  console.log('Starting database migration...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  
  console.log('Connecting to database...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log('Running migrations...');
  
  try {
    // Session storage table for connect-pg-simple
    console.log('Creating session table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default" PRIMARY KEY,
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    
    // Application tables
    console.log('Creating application tables...');
    await pool.query(`
      -- Drop tables in reverse order to avoid foreign key constraints
      DROP TABLE IF EXISTS guest_sessions;
      DROP TABLE IF EXISTS transformations;
      DROP TABLE IF EXISTS users;
      
      -- Create users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        guest_id TEXT,
        is_guest BOOLEAN DEFAULT FALSE
      );
      
      -- Create transformations table
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
      
      -- Create guest_sessions table
      CREATE TABLE IF NOT EXISTS guest_sessions (
        id SERIAL PRIMARY KEY,
        guest_id TEXT NOT NULL UNIQUE,
        usage_count INTEGER DEFAULT 0,
        max_usage INTEGER DEFAULT 10,
        created_at TEXT NOT NULL
      );
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_transformations_user_id ON transformations(user_id);
      CREATE INDEX IF NOT EXISTS idx_transformations_guest_id ON transformations(guest_id);
      CREATE INDEX IF NOT EXISTS idx_users_guest_id ON users(guest_id);
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
  .then(() => {
    console.log('All database tables created successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to complete migration:', err);
    process.exit(1);
  });