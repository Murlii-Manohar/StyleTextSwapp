import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon database
neonConfig.webSocketConstructor = ws;

// Check if memory storage is explicitly requested
const useMemoryStorage = process.env.USE_MEMORY_STORAGE === 'true';

// Only create database connection if DATABASE_URL is provided and memory storage not requested
let pool: Pool | null = null;
let db: any = null;

if (process.env.DATABASE_URL && !useMemoryStorage) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
    console.log('Connected to PostgreSQL database');
  } catch (error) {
    console.error('Failed to connect to PostgreSQL database:', error);
    console.warn('Fallback to memory storage will be used');
  }
} else {
  console.log('No DATABASE_URL provided or memory storage explicitly requested');
  console.log('Application will use in-memory storage');
}

export { pool, db };