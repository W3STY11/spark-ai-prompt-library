# ⚡ SPARK Copilot Agent - Quick Start

## 🎯 5-Minute Setup

### What You're Building
An AI assistant in Microsoft 365 Copilot that gives users instant access to 2,376+ professional prompts through natural conversation.

## 📦 What You Have

```
spark-copilot-agent.zip          # Ready to upload to Teams
function-app/src/functions/      # API endpoints (5 TypeScript files)
SPARK_COPILOT_DEPLOYMENT.md      # Full deployment guide
SOLUTION_SUMMARY.md              # What was built and why
```

## 🚀 Deploy in 3 Steps

### Step 1: Deploy API (10 minutes)

```bash
cd /home/aiwithnick/spark-ai-prompt-library/function-app

# Install and build
npm install
npm run build

# Deploy to Azure
func azure functionapp publish spark-copilot-api

# Verify it works
curl https://spark-copilot-api.azurewebsites.net/api/prompts/search?query=marketing
```

**Make sure `public/prompts_index.json` is accessible to the Function App!**

### Step 2: Upload Agent (5 minutes)

1. Go to https://dev.teams.microsoft.com
2. Click **Apps** → **Import app**
3. Upload `spark-copilot-agent.zip`
4. Click **Import** (ignore validation warnings)
5. Click **Publish** → **Publish to your org**

### Step 3: Test in Copilot (2 minutes)

1. Open Microsoft 365 Copilot
2. Click the **@** agent picker
3. Find **"SPARK Prompt Assistant"**
4. Try: *"Find me marketing prompts for social media"*

## ✅ Success Checklist

- [ ] API responds at `/api/prompts/search`
- [ ] Agent appears in Copilot agent picker
- [ ] Search returns relevant prompts
- [ ] Adaptive Cards display properly
- [ ] Favorites can be saved

## 🎓 User Examples to Try

```
"I need help with cold email outreach"
"Show me beginner writing prompts"
"What's in the Business department?"
"Find SEO content prompts"
"Recommend something for social media marketing"
```

## 🔧 Quick Fixes

### Agent doesn't appear?
- Wait 24 hours for deployment
- Check app is published in Teams admin center
- Verify manifest version is 1.19

### API errors?
- Ensure Function App is running
- Check `prompts_index.json` is accessible
- Test API endpoint directly with curl

### No results?
- Verify API base URL in `spark-openapi.json`
- Check Function App logs
- Ensure prompts data is loaded

## 📚 Next Steps

1. ✅ Read `SOLUTION_SUMMARY.md` to understand what was built
2. ✅ Review `SPARK_COPILOT_DEPLOYMENT.md` for advanced config
3. ✅ Monitor usage and gather feedback
4. ✅ Plan enhancements (analytics, auth, new features)

## 🎉 You're Done!

Your users now have an intelligent AI prompt consultant in Copilot!

**Need help?** Check the full deployment guide or Azure Function logs.

---

**Package**: `spark-copilot-agent.zip`
**API**: `spark-copilot-api.azurewebsites.net`
**Docs**: `SPARK_COPILOT_DEPLOYMENT.md`
