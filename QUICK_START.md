# SPARK Prompt Library - Quick Start

Get up and running in 5 minutes!

---

## 🏃 For Users (30 seconds)

### Access the Library

```
http://localhost:3000
```
(Or your custom deployed URL)

### Use a Prompt

1. Click **⚡ 2,425+ Prompts** button (bottom-right)
2. Search or browse
3. Click a prompt
4. Fill any variables (if needed)
5. Click **"Copy to M365 Copilot"**

**That's it!** The prompt is ready to use.

---

## 💻 For Admins (5 minutes)

### 1. Install & Deploy

**With Docker (Recommended):**
```bash
docker-compose up -d
```

**Without Docker:**
```bash
npm install
npm run api &  # Start API on port 3001
npm run dev    # Start frontend on port 3000
```

### 2. Set Admin Password

```bash
# Create .env file
cp .env.example .env

# Edit password
nano .env
# Change: ADMIN_PASSWORD=YourSecurePassword

# Restart (if using Docker)
docker-compose down && docker-compose up -d
```

### 3. Access

- **Library**: http://localhost:3000
- **Admin**: http://localhost:3000/admin-login

---

## 🔗 M365 Copilot Integration (2 minutes)

### One-Time Setup

1. Install **Tampermonkey** browser extension
   - Chrome: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
   - Firefox: https://addons.mozilla.org/firefox/addon/tampermonkey/

2. Install receiver script
   - Click Tampermonkey icon → Dashboard
   - Click + (new script)
   - Copy contents from `spark-copilot-receiver.user.js`
   - Paste and save (Ctrl+S)

3. Test
   - Open https://copilot.microsoft.com
   - Look for **"⚡ SPARK Ready"** badge (top-right)

### Usage

1. **Tab 1**: SPARK Library (`http://localhost:3000`)
2. **Tab 2**: M365 Copilot (`https://copilot.microsoft.com`)
3. In SPARK: Select prompt → Customize → Click **"Copy to M365 Copilot"**
4. In Copilot: ✅ Prompt appears automatically!

---

## ➕ Add Your First Prompt (1 minute)

### Via Website

1. Go to http://localhost:3000
2. Click **"+ Add Prompt"** button
3. Fill form:
   ```
   Title: My Custom Prompt
   Department: Choose one
   Content: Your prompt text here

   Use [VARIABLES] for customizable fields
   Example: "Write email to [TARGET AUDIENCE] about [PRODUCT]"
   ```
4. Submit

**Done!** Your prompt is now in the library.

---

## 🌐 Deploy to Internet (5 minutes)

### Railway (Easiest)

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Deploy
# - Go to railway.app
# - Connect GitHub repo
# - Auto-deploys! ✅
```

**Your URL**: `https://your-app.up.railway.app`

### Digital Ocean VPS

```bash
# 1. Create droplet (Ubuntu 22.04)
# 2. SSH to server
ssh root@your-ip

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Clone and run
git clone your-repo.git
cd your-repo
nano .env  # Set ADMIN_PASSWORD
docker-compose up -d
```

**Access**: `http://your-ip:3000`

For SSL/domain: See `DEPLOYMENT_GUIDE.md`

---

## 📚 Common Tasks

### Search Prompts
- Type anything in search box
- Filters by title, content, department, tags

### Customize Prompts
- Look for badge: `🔷 X variables`
- Fill in the form fields
- See live preview
- Copy customized version

### Edit Prompts (Admin)
1. Login: http://localhost:3000/admin-login
2. Find prompt
3. Click **Edit**
4. Make changes
5. Save (auto-backup created)

### Backup Data
```bash
# Manual backup (Admin Dashboard)
http://localhost:3000/admin → Click "Create Backup"

# Or copy file directly
cp public/prompts_index.json backups/manual_backup_$(date +%Y%m%d).json
```

### Move Floating Button
- Click and drag to any position
- Releases and saves automatically

---

## 🐛 Troubleshooting

### Can't see prompts
```bash
# Check API is running
curl http://localhost:3001/api/prompts

# Should return JSON with 2425 prompts
```

### Admin login fails
```bash
# Check .env file exists
cat .env

# Password should be set
# Restart if changed:
docker-compose down && docker-compose up -d
```

### Copilot integration doesn't work
- Check **"⚡ SPARK Ready"** badge appears in Copilot tab
- Reinstall Tampermonkey script
- Fallback: Prompt is always copied to clipboard

### Floating button disappeared
- Refresh page (F5)
- Check browser console for errors
- Clear cache: Ctrl+Shift+Delete

---

## 📖 Full Documentation

- **USER_GUIDE.md** - Complete usage guide
- **DEPLOYMENT_GUIDE.md** - All deployment options
- **CLAUDE.md** - Developer documentation
- **BULK_IMPORT_GUIDE.md** - Import many prompts at once

---

## ✅ Next Steps

1. ✅ Try the floating button
2. ✅ Search for a prompt
3. ✅ Customize one with variables
4. ✅ Install M365 integration
5. ✅ Add your own prompt
6. ✅ Deploy for your team

---

## 💡 Pro Tips

- **Use variables** in prompts: `[YOUR VARIABLE]` makes them reusable
- **Tag thoroughly**: More tags = easier to find later
- **Favorite prompts**: Click ❤️ to bookmark your best ones
- **Share with team**: Deploy once, everyone benefits
- **Regular backups**: Automated before every edit

---

**🎯 You're ready to go!**

Questions? Check the full guides or create an issue on GitHub.

**Made with ⚡ by the SPARK Team**
