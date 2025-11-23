# Quick Deploy Guide 🚀

## Ready to Deploy in 5 Minutes!

Your app is **100% ready** for Railway or Render. Just follow these simple steps:

---

## Railway (Recommended - Easiest)

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push
```

### 2. Deploy on Railway
1. Go to **https://railway.app**
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository

### 3. Add PostgreSQL
1. In your Railway project, click **"New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Done! `DATABASE_URL` is automatically created

### 4. Add Environment Variables
Click your service → **"Variables"** → Add:
```
GEMINI_API_KEY = your_key_here
SESSION_SECRET = any_random_string_32_chars
NODE_ENV = production
```

### 5. That's It!
Railway auto-detects the build/start commands from `package.json`.
Your app will be live at `yourapp.up.railway.app` in 2-3 minutes!

---

## Render (Alternative)

### 1. Push to GitHub (same as above)

### 2. Create Web Service
1. Go to **https://render.com**
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repo
5. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 3. Add PostgreSQL
1. Dashboard → **"New +"** → **"PostgreSQL"**
2. Choose Free tier
3. Copy the **Internal Database URL**

### 4. Add Environment Variables
In your Web Service → **"Environment"**:
```
DATABASE_URL = paste_internal_url_from_step_3
GEMINI_API_KEY = your_key_here
SESSION_SECRET = any_random_string_32_chars
NODE_ENV = production
```

### 5. Deploy!
Click **"Create Web Service"**
Live at `yourapp.onrender.com` in 3-5 minutes!

---

## Generate SESSION_SECRET

Open terminal and run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Environment Variables Checklist

- ✅ `GEMINI_API_KEY` - Get from https://aistudio.google.com/app/apikey
- ✅ `DATABASE_URL` - Auto-created by platform
- ✅ `SESSION_SECRET` - Random string (use command above)
- ✅ `NODE_ENV` - Set to `production`

---

## After Deployment

✅ Visit your live URL  
✅ Test guest mode (10 free uses)  
✅ Create an account  
✅ Try text transformation  
✅ Share with the world! 🎉

---

**Need help?** Check DEPLOYMENT.md for detailed troubleshooting.
