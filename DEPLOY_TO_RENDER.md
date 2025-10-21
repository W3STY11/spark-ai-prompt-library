# Deploy SPARK Prompt Library to Render.com

## Automated Deployment Instructions

Your application is ready for deployment! All code is on GitHub and configured for Render.com.

### Option 1: Automated Deployment via Render Dashboard (2 Minutes)

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Click "New +" → "Web Service"**
3. **Connect GitHub Repository**:
   - Click "Connect account" or select existing connection
   - Search for: `spark-prompt-library-live`
   - Click "Connect"

4. **Configure Service** (Render will auto-detect from render.yaml):
   - **Name**: `spark-prompt-library` (auto-filled)
   - **Region**: Oregon (auto-filled)
   - **Branch**: main (auto-filled)
   - **Build Command**: `npm install && npm run build` (auto-filled)
   - **Start Command**: `node server/production.js` (auto-filled)
   - **Plan**: Free (auto-filled)

5. **Environment Variables** (auto-filled from render.yaml):
   - NODE_ENV=production
   - PORT=3001
   - ADMIN_PASSWORD=sparkadmin2025
   - MAX_BACKUPS=100
   - BACKUP_RETENTION_DAYS=30

6. **Click "Create Web Service"**

7. **Wait 5-10 minutes** for deployment to complete

8. **Your live URL will be**: `https://spark-prompt-library-XXXX.onrender.com`

---

### Option 2: Blueprint Deployment via Render API

If you have a Render API key, you can use the Blueprint approach:

```bash
curl -X POST https://api.render.com/v1/blueprints \
  -H "Authorization: Bearer YOUR_RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ownerId": "tea-d34ep2ripnbc73ftlm50",
    "repo": "https://github.com/W3STY11/spark-prompt-library-live",
    "autoDeploy": "yes",
    "branch": "main"
  }'
```

Note: Free tier deployments may not work via API. Use Option 1 instead.

---

## What's Deployed

✅ **All 2,423 prompts** with full metadata
✅ **1,868 prompts with images**
✅ **Admin Dashboard** (password: sparkadmin2025)
✅ **Complete CRUD operations**
✅ **Backup system**
✅ **Data validation**
✅ **Pending approval workflow**
✅ **Search & filtering**
✅ **Dark/Light themes**
✅ **Mobile responsive**

---

## GitHub Repository

- **URL**: https://github.com/W3STY11/spark-prompt-library-live
- **Branch**: main
- **Latest Commit**: "Deploy SPARK Prompt Library with all 2,423 prompts and full features"
- **Files**: 10,648 files, 1,889,816 lines of code

---

## Admin Access

Once deployed, access the admin dashboard at:
- `https://your-app-url.onrender.com/admin-login`
- **Username**: (not needed, just password)
- **Password**: `sparkadmin2025`

---

## Deployment Time

- **Initial Build**: ~5-10 minutes (installing dependencies + building)
- **Subsequent Deploys**: ~3-5 minutes (cached dependencies)

---

## After Deployment

1. Visit your live URL
2. Test the homepage loads
3. Browse prompts to verify all content is there
4. Login to admin dashboard
5. Share URL with your boss

---

## Troubleshooting

If deployment fails:
1. Check build logs in Render dashboard
2. Verify all environment variables are set
3. Ensure Node version is 20+ (specified in package.json)
4. Check that render.yaml is in the root directory

---

## Alternative: Railway Deployment

If Render doesn't work, you can also deploy to Railway:

1. Go to https://railway.app/
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Connect to `W3STY11/spark-prompt-library-live`
5. Railway will auto-detect the configuration from railway.json

Railway provides automatic HTTPS URLs and is designed for Node.js apps.
