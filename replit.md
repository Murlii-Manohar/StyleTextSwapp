# Neural Style Transfer Application

## Overview
A text style transfer web application that allows users to rewrite content from one style to another using AI. The application features:
- Guest access with 10 free text transformations
- User registration and authentication for unlimited transformations
- Powered by Hugging Face's Mixtral-8x7B-Instruct model
- PostgreSQL database for persistent storage
- Modern React frontend with Tailwind CSS

## Project Architecture

### Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js, Node.js with TypeScript
- **Database**: PostgreSQL (Neon-based) with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **AI API**: Hugging Face Mixtral-8x7B-Instruct model

### Project Structure
```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility libraries
│   └── index.html
├── server/              # Express backend
│   ├── index.ts         # Main server entry point
│   ├── routes.ts        # API routes
│   ├── auth.ts          # Authentication setup
│   ├── db.ts            # Database connection
│   ├── storage.ts       # Database operations
│   ├── huggingface.ts   # AI text transformation
│   └── vite.ts          # Vite development server
├── shared/              # Shared types and schemas
│   └── schema.ts        # Drizzle database schema
└── scripts/             # Database migration scripts
```

### Database Schema
- **users**: User accounts with authentication
- **guest_sessions**: Track guest user usage (10 free transformations)
- **transformations**: History of all text transformations

## Environment Setup

### Required Environment Variables
- `HUGGINGFACE_API_KEY`: API key from Hugging Face (https://huggingface.co/settings/tokens)
- `DATABASE_URL`: PostgreSQL connection string (auto-configured by Replit)
- `SESSION_SECRET`: Session encryption key (auto-configured by Replit)

### Development Workflow
- Run: `npm run dev` (starts on port 5000)
- Build: `npm run build`
- Production: `npm start`
- Database Push: `npm run db:push`

## Replit Environment Configuration

### Port Configuration
- **Port 5000**: Main application (both frontend and backend served here)
- The Vite dev server runs in middleware mode with `allowedHosts: true` to work with Replit's proxy

### Database
- PostgreSQL database provisioned through Replit
- Tables created via SQL: users, transformations, guest_sessions
- Drizzle ORM handles all database operations

### Deployment
- Configured for autoscale deployment
- Build command: `npm run build`
- Start command: `npm start`
- Deployment serves static frontend from dist/public and API from Express

## Recent Changes (November 23, 2025)
- Initial import from GitHub
- Updated Hugging Face API endpoints from `api-inference.huggingface.co` to `router.huggingface.co`
- Created PostgreSQL database tables
- Configured workflow to run on port 5000 with webview output
- Set up deployment configuration for autoscale
- Application successfully running with guest sessions working

## Features
1. **Guest Mode**: Users can try the service with 10 free transformations
2. **User Authentication**: Sign up for unlimited transformations
3. **Style Transfer**: Transform text between different writing styles (formal, casual, academic, etc.)
4. **Style Preservation**: Adjustable slider to control how much of the original style to preserve
5. **Transformation History**: Registered users can view their past transformations

## Known Issues
- Hugging Face API validation shows 404 during startup (this is a validation check issue, not affecting actual transformations)
- Browserslist data is outdated (minor warning, doesn't affect functionality)
