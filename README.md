# Neural Style Transfer Application

A text style transfer web application with guest login (10-chat limit) and user authentication that rewrites content from one style to another.

## Features

- Transform text from one style to another (e.g., formal to casual, academic to simple)
- Guest access with 10 free transformations
- User registration and authentication for unlimited transformations
- Powered by Hugging Face models for high-quality text transformations
- History of transformations for registered users

## Running Locally

### Option 1: Using In-Memory Storage (Easiest)

This option doesn't require a database setup and is perfect for local testing:

1. Clone the repository to your local machine

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Hugging Face API key as an environment variable:
   - For Windows:
     ```bash
     set HUGGINGFACE_API_KEY=your_huggingface_key_here
     ```
   - For macOS/Linux:
     ```bash
     export HUGGINGFACE_API_KEY=your_huggingface_key_here
     ```

4. Run the application using one of the provided scripts:
   
   - For Windows users, simply run the batch file:
     ```
     run-local.bat
     ```
   
   - For macOS/Linux or Node.js environments:
     ```bash
     node run-local.js
     ```
     
   - If you encounter issues with the scripts above, try the simplified version:
     ```bash
     # First build the TypeScript files
     npm run build
     
     # Then run the simple script
     node run-simple.js
     
     # Or on Windows:
     run-simple.bat
     ```

5. Visit http://localhost:5000 in your browser

### Option 2: Using a PostgreSQL Database

If you want to use a real PostgreSQL database for persistent storage:

1. Install PostgreSQL on your machine from [postgresql.org](https://www.postgresql.org/download/)

2. Create a new database:
   ```bash
   createdb text_style_transfer
   ```

3. Set up your local DATABASE_URL environment variable:
   ```
   # Windows
   set DATABASE_URL=postgresql://username:password@localhost:5432/text_style_transfer
   
   # macOS/Linux
   export DATABASE_URL=postgresql://username:password@localhost:5432/text_style_transfer
   ```

4. Set up your API keys as environment variables as in Option 1

5. Run the migration script to create all necessary tables:
   ```bash
   node scripts/migrate.js
   ```

6. Start the application:
   ```bash
   npm run dev
   ```

7. Visit http://localhost:5000 in your browser

## API Keys

This application requires an API key for text transformation:

- **Hugging Face API Key**: Get from [Hugging Face](https://huggingface.co/settings/tokens) by creating a free account

## Technology Stack

- **Frontend**: React, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **API**: Hugging Face (Mixtral-8x7B-Instruct model)

## Additional Documentation

- [DATABASE.md](DATABASE.md) - Details about the database schema and migration utility