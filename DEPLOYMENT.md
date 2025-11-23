# Deployment Guide

This guide covers deploying your Neural Style Transfer app to Railway or Render.

## Prerequisites

Both platforms offer:
- Free tier to get started
- Easy PostgreSQL database setup
- GitHub integration for automatic deployments

## Option A: Deploy to Railway

Railway is the simplest option with excellent PostgreSQL integration.

### Step 1: Prepare Your Repository

1. Push your code to GitHub (if not already there)
2. Make sure `.gitignore` excludes `node_modules` and `.env`

### Step 2: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"

### Step 3: Deploy from GitHub

1. Select "Deploy from GitHub repo"
2. Choose your repository
3. Railway will automatically detect it's a Node.js app

### Step 4: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway automatically creates `DATABASE_URL` environment variable

### Step 5: Set Environment Variables

In Railway project settings → Variables, add:

```
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_random_secret_here
NODE_ENV=production
```

### Step 6: Configure Build & Start

Railway auto-detects from `package.json`, but verify:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### Step 7: Deploy

Click "Deploy" - Railway will:
1. Install dependencies
2. Run build
3. Start your app
4. Give you a public URL (e.g., `yourapp.up.railway.app`)

---

## Option B: Deploy to Render

Render offers similar features with a generous free tier.

### Step 1: Prepare Your Repository

1. Push your code to GitHub
2. Ensure `.gitignore` excludes `node_modules` and `.env`

### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +"

### Step 3: Create Web Service

1. Select "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: your-app-name
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid tier for better performance)

### Step 4: Add PostgreSQL Database

1. Go to Dashboard → "New +"
2. Select "PostgreSQL"
3. Choose Free tier
4. Note the connection details

### Step 5: Set Environment Variables

In your Web Service → Environment:

```
DATABASE_URL=your_postgres_connection_string_from_step_4
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_random_secret_here
NODE_ENV=production
```

For `DATABASE_URL`, copy the **Internal Database URL** from your Render PostgreSQL database.

### Step 6: Deploy

Click "Create Web Service" - Render will:
1. Clone your repo
2. Install dependencies
3. Build and start
4. Give you a public URL (e.g., `yourapp.onrender.com`)

---

## Environment Variables You Need

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `GEMINI_API_KEY` | Google Gemini API key | https://aistudio.google.com/app/apikey |
| `DATABASE_URL` | PostgreSQL connection string | Auto-created by Railway/Render |
| `SESSION_SECRET` | Random string for sessions | Generate with: `openssl rand -base64 32` |
| `NODE_ENV` | Set to `production` | Manually set |

---

## Testing Your Deployment

After deployment:

1. Visit your app's URL
2. Test guest mode (10 free transformations)
3. Try creating an account
4. Test text transformation
5. Verify transformation history works

---

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check database is in the same region as your app
- Ensure SSL is enabled in connection string (add `?sslmode=require`)

### Build Failures
- Check build logs for errors
- Verify all dependencies in `package.json`
- Ensure Node.js version compatibility (v20.x)

### App Won't Start
- Check start command is `npm start`
- Verify `NODE_ENV=production` is set
- Review application logs for errors

### API Key Issues
- Verify `GEMINI_API_KEY` is set
- Check API key is valid at https://aistudio.google.com
- Ensure API key has sufficient quota

---

## Cost Estimates

### Railway Free Tier
- $5 free credit monthly
- ~500 hours of runtime
- PostgreSQL included

### Render Free Tier
- Free web services (with limitations)
- Sleep after 15 min inactivity
- 750 hours/month
- Free PostgreSQL (expires after 90 days)

For production with consistent traffic, consider paid tiers (~$7-20/month).

---

## Post-Deployment

After successful deployment:
1. ✅ Set up custom domain (optional)
2. ✅ Monitor usage and costs
3. ✅ Set up database backups
4. ✅ Configure CI/CD for automatic deployments
5. ✅ Add monitoring/logging (Railway/Render provide built-in tools)
