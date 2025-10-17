# 🚀 SPARK Prompt Library - Complete Installation Guide

**What You're Getting:**
- ✅ All 2,376 AI prompts pre-loaded
- ✅ Browse Library (public access)
- ✅ Admin Dashboard (password-protected)
- ✅ Automatic backups
- ✅ Copilot button integration
- ✅ Works on Windows, Mac, and Linux

---

## 📋 What You Need First

### Install Docker Desktop (One-time setup)

**Windows:**
1. Go to: https://www.docker.com/products/docker-desktop/
2. Download "Docker Desktop for Windows"
3. Run the installer
4. Restart your computer when prompted
5. Open Docker Desktop and wait for it to start

**Mac:**
1. Go to: https://www.docker.com/products/docker-desktop/
2. Download "Docker Desktop for Mac"
3. Open the .dmg file and drag Docker to Applications
4. Open Docker Desktop from Applications
5. Wait for it to start (whale icon in menu bar)

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

---

## 🎯 Installation Steps (EXACT COPY-PASTE)

### Step 1: Get the Files

**Option A - If you have the zip file:**
1. Unzip `Spark_AI_Prompt_Library_FINAL.zip` to your Desktop
2. You'll see a folder called `Spark_AI_Prompt_Library_FINAL`

**Option B - If sharing via GitHub:**
```bash
cd Desktop
git clone [YOUR_GITHUB_URL]
cd Spark_AI_Prompt_Library_FINAL
```

---

### Step 2: Start the Application

**Open Terminal/Command Prompt:**

**Windows:**
- Press `Windows + R`
- Type: `cmd`
- Press Enter

**Mac:**
- Press `Command + Space`
- Type: `Terminal`
- Press Enter

**Then run these commands:**
```bash
cd Desktop/Spark_AI_Prompt_Library_FINAL
docker-compose up
```

**Wait for this message:**
```
✅ API Server running
✅ Frontend ready
```

---

### Step 3: Open Your Browser

**Open these URLs in your web browser:**

**Browse Library (for everyone):**
```
http://localhost:3000/browse.html
```
→ Search and view all 2,376 prompts

**Admin Dashboard (for admins):**
```
http://localhost:3000/admin-login.html
```
→ Login with password: `[SET_IN_.ENV_FILE]`

---

## 🎉 You're Done!

**What You Can Do:**

### As a User:
- Browse all 2,376 prompts
- Search by keyword
- Filter by department (Business, Marketing, Sales, etc.)
- Copy prompts to use
- Add new prompts

### As an Admin:
- Everything users can do PLUS:
- Edit any prompt
- Delete prompts (with automatic backup)
- Run manual backups
- Check data quality
- Export prompts to JSON
- View statistics

---

## 🛑 To Stop the Application

In the terminal where it's running, press:
```
Ctrl + C
```

---

## 🔄 To Start Again Later

**Just run:**
```bash
cd Desktop/Spark_AI_Prompt_Library_FINAL
docker-compose up
```

**Then open the browser URLs again.**

---

## 📊 Troubleshooting

### "Port already in use" error:
```bash
docker-compose down
docker-compose up
```

### "Cannot connect to Docker daemon":
- Make sure Docker Desktop is running
- Look for the whale icon (Windows/Mac)
- Restart Docker Desktop if needed

### Prompts not showing:
- Wait 30 seconds after starting
- Refresh your browser (F5)
- Check both servers started successfully

### Can't login to admin:
- Password: `[SET_IN_.ENV_FILE]`
- Make sure you're at: `http://localhost:3000/admin-login.html`
- Clear browser cookies and try again

---

## 📦 What's Included

```
Spark_AI_Prompt_Library_FINAL/
├── public/
│   └── prompts_index.json          ← All 2,376 prompts
├── backups/                        ← Automatic backups stored here
├── server/                         ← API server code
├── src/                            ← Frontend pages
├── docker-compose.yml              ← Main configuration
├── Dockerfile.api                  ← API container setup
├── Dockerfile.frontend             ← Frontend container setup
└── INSTALLATION_GUIDE.md           ← This file
```

---

## 🔐 Admin Password

**Default password:** `[SET_IN_.ENV_FILE]`

**To change it:**
1. Edit `.env` file
2. Change `ADMIN_PASSWORD=NewPassword123`
3. Restart with `docker-compose restart`

---

## 🤝 Sharing with Team

**To share with boss/coworker:**

### Method 1 - Send the folder:
1. Zip the entire `Spark_AI_Prompt_Library_FINAL` folder
2. Send via email/Dropbox/Google Drive
3. They follow this same installation guide

### Method 2 - GitHub (recommended):
1. Push to GitHub
2. Share the repository URL
3. They clone and follow this guide

**They get:**
- ✅ Same 2,376 prompts
- ✅ Same admin access
- ✅ Same features
- ✅ Everything you have!

---

## ✅ Success Checklist

- [ ] Docker Desktop installed and running
- [ ] Ran `docker-compose up` successfully
- [ ] Can open http://localhost:3000/browse.html
- [ ] Can see all 2,376 prompts in browse library
- [ ] Can login to admin at http://localhost:3000/admin-login.html
- [ ] Admin password `[SET_IN_.ENV_FILE]` works
- [ ] Can search, filter, and view prompts
- [ ] Copilot button visible and working

---

## 📞 Support

If you have issues:
1. Make sure Docker Desktop is running
2. Try `docker-compose down` then `docker-compose up`
3. Check the terminal for error messages
4. Restart Docker Desktop
5. Restart your computer

---

**That's it! You're ready to use the SPARK Prompt Library!** 🎉
