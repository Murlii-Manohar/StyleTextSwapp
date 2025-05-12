#!/usr/bin/env node

/**
 * Simple local development runner script for Text Style Transfer App
 * 
 * This script provides a simplified way to run the app without dependencies on tsx or npx
 */

const { spawn } = require('child_process');
const path = require('path');

// Environment variables for local development
process.env.NODE_ENV = 'development';
process.env.USE_MEMORY_STORAGE = 'true';

// Add sample Hugging Face API key environment variable (user should replace this)
if (!process.env.HUGGINGFACE_API_KEY) {
  process.env.HUGGINGFACE_API_KEY = 'YOUR_HUGGINGFACE_API_KEY_HERE';
}

// Secret for express session
process.env.SESSION_SECRET = 'local-dev-secret-key';

console.log('\n---- Starting Text Style Transfer App in Simple Mode ----');
console.log('💾 Using in-memory storage (no database required)');
console.log('🔑 Hugging Face API key needed for text transformation functionality');
console.log('⚠️  IMPORTANT: Replace the dummy Hugging Face API key with a real one in environment variables\n');

// This approach uses node directly to run the compiled JS version
// First run: npm run build
// Then this script will run the compiled version
console.log('Note: This requires you to have built the TypeScript files first using:');
console.log('npm run build');
console.log('\nStarting server...\n');

const devProcess = spawn('node', ['dist/server/index.js'], {
  stdio: 'inherit',
  env: process.env
});

devProcess.on('error', (err) => {
  console.error('Failed to start development server:', err);
  console.log('\nTroubleshooting:');
  console.log('1. Make sure you have run "npm run build" first');
  console.log('2. Check if node is installed and in your PATH');
  console.log('3. Try running "npm install" to ensure all dependencies are installed');
});

console.log('\n---- Development server started ----');
console.log('📝 Visit http://localhost:5000 in your browser');
console.log('💡 Press Ctrl+C to stop the server\n');