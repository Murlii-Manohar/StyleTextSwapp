# Neural Style Transfer Application

## Overview
A text style transfer web application that uses Google Gemini AI to rewrite content from one style to another. Features guest login (10-chat limit) and user authentication for unlimited transformations.

## Setup Date
Imported and configured: November 23, 2025

## Technology Stack
- **Frontend**: React, Tailwind CSS, shadcn/ui components, Vite
- **Backend**: Express.js, Node.js (TypeScript)
- **Database**: PostgreSQL (Neon serverless) with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **AI API**: Google Gemini 2.5 Flash (via @google/genai package)

## Features
- Transform text from one style to another (e.g., formal to casual, academic to simple)
- Guest access with 10 free transformations per session
- User registration and authentication for unlimited transformations
- Transformation history for registered users
- Style preservation slider (0-100%)
- Real-time text transformation

## Environment Configuration
The application is configured to run in the Replit environment:

### Required Secrets
- `GEMINI_API_KEY` - Google Gemini API key for text transformations (get from https://aistudio.google.com/app/apikey)
- `HUGGINGFACE_API_KEY` - Legacy, not currently used (replaced with Gemini)

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit)
- `SESSION_SECRET` - Auto-generated session secret

### Database Schema
Tables:
- `users` - User accounts with username/password authentication
- `guest_sessions` - Guest session tracking with usage limits
- `transformations` - History of all text transformations

## Development
- **Dev Server**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build`
- **Production**: `npm start`
- **Database Push**: `npm run db:push` (sync schema with database)

## Port Configuration
- **Frontend & Backend**: Port 5000 (combined server)
- **Host**: 0.0.0.0 (configured for Replit's proxy environment)
- **Vite Config**: `allowedHosts: true` (required for Replit iframe preview)

## Key Implementation Details

### AI Integration
- Initially used Hugging Face API (Mixtral-8x7B-Instruct model)
- Migrated to Google Gemini 2.5 Flash for better reliability and quota management
- API endpoint: Uses @google/genai package with v1beta API

### Database
- Uses Neon serverless PostgreSQL via Drizzle ORM
- Supports automatic fallback to in-memory storage if database unavailable
- Schema managed through Drizzle Kit

### Authentication
- Local username/password strategy with Passport.js
- Session-based authentication with express-session
- Guest sessions stored in database with usage tracking

## Project Structure
```
.
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── hooks/       # Custom React hooks
│   └── index.html
├── server/          # Express backend
│   ├── index.ts     # Server entry point
│   ├── routes.ts    # API routes
│   ├── auth.ts      # Authentication setup
│   ├── gemini.ts    # Gemini AI integration
│   ├── db.ts        # Database connection
│   ├── storage.ts   # Data access layer
│   └── vite.ts      # Vite dev server setup
├── shared/          # Shared types and schemas
│   └── schema.ts    # Drizzle database schema
└── package.json
```

## Recent Changes
- **Nov 23, 2025**: Imported from GitHub
- **Nov 23, 2025**: Configured for Replit environment
- **Nov 23, 2025**: Migrated from Hugging Face to Google Gemini API
- **Nov 23, 2025**: Fixed API endpoint compatibility (old api-inference.huggingface.co → router.huggingface.co)
- **Nov 23, 2025**: Updated to Gemini 2.5 Flash (from retired 1.5 models)
- **Nov 23, 2025**: Created database tables via SQL execution
- **Nov 23, 2025**: Configured deployment settings for autoscale

## Deployment
Deployment is configured for Replit Autoscale:
- **Build**: `npm run build`
- **Run**: `npm start`
- **Type**: Autoscale (stateless, suitable for web apps)

## Notes
- The application serves both frontend and backend from the same Express server on port 5000
- Vite is used in dev mode for hot module replacement
- Production mode serves pre-built static files from dist/public
- Database migrations are handled through Drizzle Kit
- Browser console 401 errors on initial load are expected (authentication check)
