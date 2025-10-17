# 🚀 Railway Deployment Guide

This guide will help you deploy **PromptForge** to Railway for free, so you can share it with your dad (or anyone) via a simple URL.

## 📋 What You'll Get

- **Free hosting** on Railway's free tier
- **Live URL** to share (e.g., `your-app-name.railway.app`)
- **Public access** for browsing prompts (no login required)
- **Secure admin dashboard** (password protected)
- **Automatic HTTPS** (secure connection)

## 🔐 Important: Privacy & Access

**Good news!** The library is already set up perfectly for your use case:

- ✅ **Public browsing**: Your dad can browse all prompts without any login
- ✅ **Protected admin**: Only you can add/edit/approve prompts (with password)
- ✅ **Private URL**: Railway URLs are not indexed by Google (semi-private)
- ✅ **Secure**: HTTPS enabled automatically

## 📝 Step-by-Step Deployment

### 1️⃣ Create Railway Account

1. Go to https://railway.app
2. Click **"Start a New Project"** (or **"Login"** if you have an account)
3. Sign up with GitHub (recommended) or email

### 2️⃣ Push Your Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Railway deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/promptforge.git
git push -u origin main
```

### 3️⃣ Deploy to Railway

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `promptforge` repository
4. Railway will auto-detect the configuration from `railway.json`

### 4️⃣ Set Environment Variables

In Railway dashboard:

1. Click on your deployed service
2. Go to **"Variables"** tab
3. Add these variables:

```
ADMIN_PASSWORD=sparkadmin2025
NODE_ENV=production
MAX_BACKUPS=100
```

**Important:** Change `ADMIN_PASSWORD` to something secure! This protects your admin dashboard.

### 5️⃣ Wait for Deployment

- Railway will automatically build and deploy your app
- This takes 2-5 minutes
- Watch the **"Deployments"** tab for progress

### 6️⃣ Get Your URL

1. In Railway, click on your service
2. Go to **"Settings"** tab
3. Under **"Domains"**, click **"Generate Domain"**
4. Railway creates a URL like: `your-app-name.up.railway.app`
5. **Copy this URL** and send it to your dad!

## 📲 Sharing with Your Dad

Send him the URL like:

```
Hey Dad! Check out PromptForge - my AI Prompt Library:
https://promptforge.up.railway.app

You can browse all 2,376+ prompts by department.
No login needed - just click around!
```

## 🔒 Admin Access (For You Only)

To manage prompts:

1. Go to: `https://your-app-name.up.railway.app/admin-login`
2. Enter your `ADMIN_PASSWORD` (from Railway variables)
3. You can now approve pending prompts, add new ones, etc.

## 🎯 What Your Dad Will See

- **Homepage**: Department cards (Business, Marketing, SEO, etc.)
- **Browse page**: All prompts with search and filters
- **View page**: Individual prompts with full content
- **No admin access**: He won't see any admin features

## 🔧 Making Updates

After deploying, you can keep developing:

```bash
# Make your changes locally
git add .
git commit -m "Added new feature"
git push

# Railway automatically redeploys!
```

Railway detects changes and redeploys automatically. Your dad's URL stays the same!

## 💰 Free Tier Limits

Railway free tier includes:

- **$5 free credit per month**
- **500 hours of usage** (plenty for your use case)
- If you run out, app sleeps until next month (or upgrade for $5/month)

## 🆘 Troubleshooting

### Build Failed

Check Railway logs:
1. Click on your service
2. Go to **"Deployments"** tab
3. Click the failed deployment
4. Check **"Build Logs"** for errors

### Can't Access URL

- Wait 2-3 minutes after deployment completes
- Make sure you clicked **"Generate Domain"** in Settings
- Try incognito/private browsing mode

### Admin Login Not Working

- Double-check `ADMIN_PASSWORD` in Railway variables
- Make sure it matches exactly (case-sensitive)
- Try logging out and back in

### App Keeps Crashing

Check **"Logs"** tab in Railway for errors. Common fixes:
- Ensure `NODE_ENV=production` is set
- Verify all environment variables are set correctly

## 📞 Need Help?

If deployment fails or you get stuck:

1. Check Railway **"Logs"** tab for error messages
2. Verify all environment variables are set
3. Make sure `railway.json` and `server/production.js` exist
4. Try redeploying: Click **"Redeploy"** button

## 🎉 Success Checklist

- ✅ Railway account created
- ✅ Code pushed to GitHub
- ✅ Railway project created and deployed
- ✅ Environment variables set (especially `ADMIN_PASSWORD`)
- ✅ Domain generated
- ✅ URL shared with dad
- ✅ Verified dad can browse prompts
- ✅ Verified you can login to admin

---

**You're all set!** Your dad can now explore all the prompts while you continue to add features and improve the library. 🚀
