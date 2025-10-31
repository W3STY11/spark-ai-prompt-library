# SPARK Copilot Agent - Testing Guide

## Deployment Status ✓

**Status**: UPDATED WITH RAG INSTRUCTIONS (v1.0.3)
- **App ID**: 5783104e-c216-4184-bd48-a49b283e24fd
- **Version**: 1.0.3 (UPDATED: 2025-10-28)
- **Distribution**: Organization (treasuryfinops.com)
- **Installed For**: NicholasWestburg@treasuryfinops.com
- **Key Change**: Agent now functions as RAG system - searches library and returns EXACT prompt data with full content field (300-500+ words)

## API Endpoints ✓

**Base URL**: https://spark-copilot-api.azurewebsites.net/api

### Available Endpoints:
1. `GET /health` - Health check endpoint
2. `GET /prompts?limit=N` - Get N prompts from library
3. `GET /searchPrompts?query=TERM` - Search prompts by keyword
4. `POST /messages` - Bot Framework messages endpoint

## How to Use in Microsoft Teams

### Step 1: Open Teams
1. Launch Microsoft Teams desktop or web app
2. You should be logged in as NicholasWestburg@treasuryfinops.com

### Step 2: Find SPARK Prompts
1. Click the **Apps** icon in the left sidebar (looks like a grid of dots)
2. In the "Built for your org" section, look for **SPARK Prompts**
3. Click on it to open

### Step 3: Start Using
Once opened, you can:
- Browse available commands
- Ask the agent questions
- Search for prompts by department or keyword

## How to Use in Microsoft 365 Copilot

### In Copilot Chat:
1. Open Microsoft 365 Copilot (in Teams, Edge, or Office apps)
2. Type `@SPARK` followed by your request
3. Examples:
   ```
   @SPARK find marketing prompts
   @SPARK search for sales email templates
   @SPARK show me productivity tips
   @SPARK get business strategy prompts
   ```

### Example Conversations:
```
You: @SPARK search marketing
Agent: [Returns list of marketing prompts from the 2,376+ library]

You: @SPARK find email templates
Agent: [Searches for email-related prompts across all departments]

You: @SPARK list SEO prompts
Agent: [Returns SEO department prompts]
```

## Testing the API Directly

### Health Check:
```bash
curl https://spark-copilot-api.azurewebsites.net/api/health
```
Expected: `{"status":"healthy","timestamp":"..."}`

### Search Test:
```bash
curl "https://spark-copilot-api.azurewebsites.net/api/searchPrompts?query=marketing"
```
Expected: JSON array with matching prompts

### Get Prompts Test:
```bash
curl "https://spark-copilot-api.azurewebsites.net/api/prompts?limit=5"
```
Expected: JSON object with 5 prompts

## Troubleshooting

### "App not found"
- Make sure you're logged in as NicholasWestburg@treasuryfinops.com
- Try refreshing Teams (Ctrl+R or Cmd+R)
- Check the Apps section under "Built for your org"

### "@SPARK doesn't work in Copilot"
- Make sure Copilot is enabled for your tenant
- Try typing the full agent name: "@SPARK Prompts"
- Refresh the Copilot interface

### API timeouts
- First request may take 30-60 seconds (cold start)
- Subsequent requests should be faster
- Check Azure Function logs if issues persist

## Verification Commands

Run these to verify the deployment:

```bash
# Check app is published
pwsh -File enable-copilot-agent.ps1

# Check app is installed for user
pwsh -Command "Connect-MgGraph -Scopes 'TeamsAppInstallation.ReadForUser' -NoWelcome; \
  \$me = Invoke-MgGraphRequest -Method GET -Uri 'https://graph.microsoft.com/v1.0/me'; \
  \$apps = Invoke-MgGraphRequest -Method GET -Uri \"https://graph.microsoft.com/v1.0/users/\$(\$me.id)/teamwork/installedApps?\\`$expand=teamsApp\"; \
  \$apps.value | Where-Object { \$_.teamsApp.id -eq '5783104e-c216-4184-bd48-a49b283e24fd' } | Format-List"
```

## Next Steps

1. **Test in Teams**: Open Teams and find SPARK Prompts in the Apps section
2. **Test in Copilot**: Use @SPARK commands in Copilot chat
3. **Verify API**: Test the API endpoints to ensure they respond
4. **Report Issues**: Check Azure Function logs if anything doesn't work

## Success Criteria

- ✓ App uploaded to Microsoft 365
- ✓ App published to organization
- ✓ App installed for user account
- ✓ API endpoints deployed and accessible
- ✓ OpenAPI spec correctly configured
- ✓ Agent updated with new instructions (v1.0.2)
- ? App visible in Teams (user verification needed)
- ? @SPARK returns COMPLETE prompts immediately (user verification needed)
- ? API returns prompt data (cold start may cause delays)

## What Changed in v1.0.2

The agent behavior has been completely overhauled:

### OLD Behavior (v1.0.1) - WRONG ❌
User: "find me marketing prompts"
Agent: "Thanks for your request! What kind of marketing are you focused on? Social media, email, or...?"

### NEW Behavior (v1.0.2) - CORRECT ✅
User: "find me marketing prompts"
Agent: Returns 3-5 COMPLETE prompts immediately with:
- Full prompt title, department, complexity, word count
- COMPLETE prompt content (the actual prompt text to copy/paste)
- All tips from tips array
- Tags, images, example inputs/outputs
- No questions asked - just immediate results

### Expected Response Format

```
**Social Media Content Calendar Creator** (📁 Marketing | ⚙️ Intermediate | 📊 425 words)

**Description:** Create a comprehensive 30-day social media content calendar...

**The Prompt:**
```
#CONTEXT:
You are a social media marketing expert specializing in...
[FULL PROMPT TEXT HERE - 425 words]
```

**💡 Tips & How to Use:**
1. Start by defining your brand voice...
2. Research trending hashtags...
3. [etc...]

**🏷️ Tags:** social-media, content-planning, marketing-strategy

**📸 Visuals:** [image filenames if present]

---

[Next complete prompt...]
```

## Additional Resources

- **Azure Function Logs**: Check logs in Azure Portal for spark-copilot-api
- **Teams Admin Center**: Manage app distribution settings
- **Graph API Explorer**: Test Graph API calls manually
- **OpenAPI Spec**: See spark-openapi.json for available operations
