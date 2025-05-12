@echo off
echo.
echo ---- Starting Text Style Transfer App in Simple Mode ----
echo.

:: Set environment variables
set NODE_ENV=development
set USE_MEMORY_STORAGE=true

:: Set your Hugging Face API key here (required)
set HUGGINGFACE_API_KEY=YOUR_HUGGINGFACE_API_KEY_HERE

:: Secret for express session
set SESSION_SECRET=local-dev-secret-key

echo IMPORTANT: Make sure to replace the dummy Hugging Face API key with a real one!
echo.
echo Note: This requires you to have built the TypeScript files first using:
echo npm run build
echo.
echo Starting server...
echo.

:: Start the application using compiled JavaScript
node dist/server/index.js

pause