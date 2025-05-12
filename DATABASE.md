# Database Documentation for Neural Style Transfer App

## Overview

This application uses PostgreSQL for persistent storage managed through Drizzle ORM. The database stores user information, text transformations, and guest sessions.

## Database Schema

### Tables

1. **users**
   - `id`: Serial primary key
   - `username`: Unique text identifier
   - `password`: Hashed password string
   - `guest_id`: Optional reference to guest session ID
   - `is_guest`: Boolean flag for guest users

2. **transformations**
   - `id`: Serial primary key
   - `user_id`: Foreign key to users.id
   - `guest_id`: Optional guest session ID for non-registered users
   - `original_text`: Original input text
   - `transformed_text`: Result after style transformation
   - `from_style`: Source style
   - `to_style`: Target style
   - `created_at`: Timestamp

3. **guest_sessions**
   - `id`: Serial primary key
   - `guest_id`: Unique guest identifier
   - `usage_count`: Number of transformations used
   - `max_usage`: Maximum allowed transformations (default: 10)
   - `created_at`: Timestamp

4. **session**
   - Used by connect-pg-simple for session management
   - Contains session data for authenticated users

## Migration Utilities

### Database Migration

To create or reset all database tables:

```bash
./scripts/migrate.sh
```

This will:
1. Drop existing tables if they exist
2. Create all required tables
3. Set up proper indexes
4. Create the session table for connect-pg-simple

### Schema Push

To push the Drizzle schema to the database:

```bash
./scripts/schema-push.sh
```

This is an alternative approach that uses Drizzle ORM to create or update tables based on the schema definition.

## Connection Management

The application connects to PostgreSQL using the DATABASE_URL environment variable through the @neondatabase/serverless package.

## Session Management

Session data is stored in the PostgreSQL database using connect-pg-simple. This enables persistent sessions across server restarts and scaling.

## Guest User Flow

1. On first visit, a guest session is created with:
   - Unique guestId (UUID)
   - Usage count set to 0
   - Maximum usage set to 10
   
2. Guest transformations are tracked against this session
   - Each transformation increments the usage count
   - When max usage is reached, user is prompted to register

3. After registration, the guest account can be linked to the registered user account to preserve transformation history

## Data Models

For detailed type definitions and schema declarations, see `shared/schema.ts`.