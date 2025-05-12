// This script pushes the Drizzle schema to the database
// It's a more type-safe alternative to the SQL migration script

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from 'ws';
import * as schema from '../shared/schema.js';

// Required for Neon database connection
neonConfig.webSocketConstructor = ws;

async function main() {
  console.log('Starting Drizzle schema push...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  
  console.log('Connecting to database...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema });

  console.log('Pushing schema...');
  try {
    // This is a simple approach that recreates tables based on the schema
    // For a production environment with data, use proper migrations instead
    
    // First create tables for session storage (not handled by Drizzle schema)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default" PRIMARY KEY,
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    
    // Use Drizzle's push mechanism to update or create tables based on schema
    await db.execute(schema.users.sql);
    await db.execute(schema.transformations.sql);
    await db.execute(schema.guestSessions.sql);
    
    console.log('Schema push completed successfully');
  } catch (error) {
    console.error('Schema push failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main()
  .then(() => {
    console.log('Schema pushed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to push schema:', err);
    process.exit(1);
  });