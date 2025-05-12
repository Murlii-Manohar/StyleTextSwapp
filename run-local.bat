@echo off
echo ---- Starting Text Style Transfer App in Local Mode ----
echo Using in-memory storage (no database required)

:: Set environment variables
set NODE_ENV=development
set USE_MEMORY_STORAGE=true

:: Set your Hugging Face API key here (required)
set HUGGINGFACE_API_KEY=YOUR_HUGGINGFACE_API_KEY_HERE

:: Secret for express session
set SESSION_SECRET=local-dev-secret-key

echo.
echo IMPORTANT: Make sure to replace the dummy Hugging Face API key with a real one!
echo.

:: Start the application
npx tsx server/index.ts

pause