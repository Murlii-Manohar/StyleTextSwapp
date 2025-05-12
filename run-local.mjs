#!/usr/bin/env node

/**
 * Local development runner script for Text Style Transfer App
 */

import { spawn } from 'child_process';

// Environment variables for local development
process.env.NODE_ENV = 'development';
process.env.USE_MEMORY_STORAGE = 'true';

// Add sample Hugging Face API key environment variable (user should replace this)
if (!process.env.HUGGINGFACE_API_KEY) {
  process.env.HUGGINGFACE_API_KEY = 'YOUR_HUGGINGFACE_API_KEY_HERE';
}

// Secret for express session
process.env.SESSION_SECRET = 'local-dev-secret-key';

console.log('\n---- Starting Text Style Transfer App in Local Mode ----');
console.log('💾 Using in-memory storage (no database required)');
console.log('🔑 Hugging Face API key needed for text transformation functionality');
console.log('⚠️  IMPORTANT: Replace the dummy Hugging Face API key with a real one in environment variables\n');

// Start the dev server using the standard dev script
// Try to use node directly instead of npx
const devProcess = spawn('node', ['--require', 'tsx/cjs', 'server/index.ts'], {
  stdio: 'inherit',
  env: process.env
});

devProcess.on('error', (err) => {
  console.error('Failed to start development server:', err);
});

console.log('\n---- Development server started ----');
console.log('📝 Visit http://localhost:5000 in your browser');
console.log('💡 Press Ctrl+C to stop the server\n');