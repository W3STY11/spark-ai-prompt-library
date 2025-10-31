# 🚀 SPARK Copilot Agent - Deployment Guide

## Overview

This guide explains how to deploy the **SPARK Prompt Assistant** - an intelligent Copilot agent that brings your 2,376+ prompt library directly into Microsoft 365 Copilot chat.

## 🎯 What This Solution Does

Transform your prompt library from a static website into an **interactive AI assistant** that users can chat with in Microsoft 365 Copilot:

### Key Features:
- **Natural Language Search**: "Find me marketing prompts for social media"
- **Intelligent Recommendations**: Get personalized prompt suggestions based on use case
- **Instant Access**: View full prompts with tips and examples in beautiful Adaptive Cards
- **Favorites Management**: Save and recall your most-used prompts
- **Department Browsing**: Explore 2,376+ prompts across 9 departments
- **Context-Aware**: Agent understands your needs and recommends the best prompts

### User Experience Examples:

```
User: "I need help writing cold emails for my SaaS product"
SPARK: Great! I found 3 highly relevant sales prompts for cold email outreach.
        Here are your best options... [shows formatted cards]

User: "Show me prompt #1234"
SPARK: Here's the complete prompt with usage tips and examples.
        Would you like me to help customize it for your needs?

User: "Recommend something for SEO content"
SPARK: Based on your request, I recommend these 5 prompts...
        [Personalized suggestions with reasons why each works]
```

## 📦 Package Contents

The `spark-copilot-agent.zip` contains:

1. **manifest.json** - Teams app configuration
2. **spark-declarative-agent.json** - Agent personality and instructions
3. **spark-plugin.json** - API plugin with 6 powerful functions
4. **spark-openapi.json** - Complete OpenAPI specification
5. **spark-color-192.png** - Color app icon
6. **spark-outline-32.png** - Outline icon

## 🔧 Prerequisites

1. **Microsoft 365 Copilot License** - Required for your tenant
2. **Azure Subscription** - For hosting the API
3. **Admin Access** - To Teams Developer Portal and Azure
4. **SPARK Prompts Data** - Your `prompts_index.json` file

## 📋 Step-by-Step Deployment

### Step 1: Deploy API Endpoints

The API endpoints power the agent's functionality. Deploy them to Azure Functions:

```bash
cd /home/aiwithnick/spark-ai-prompt-library/function-app

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to Azure
func azure functionapp publish spark-copilot-api
```

**Required Function Endpoints:**
- `GET /api/prompts/search` - Search prompts
- `GET /api/prompts/{id}` - Get prompt details
- `GET /api/users/me/favorites` - Get user favorites
- `POST /api/users/me/favorites` - Add to favorites
- `POST /api/prompts/recommend` - Get recommendations
- `GET /api/departments/{name}/prompts` - Browse by department

### Step 2: Copy Prompts Data

The API needs access to your prompts index:

```bash
# Copy prompts data to Function App
cp public/prompts_index.json function-app/public/
```

Or configure the Function App to read from your existing hosting:

```typescript
// In functions, update loadPrompts() to fetch from:
const response = await fetch('https://spark-prompts.azurewebsites.net/prompts_index.json');
```

### Step 3: Configure API Base URL

Update the OpenAPI spec with your Function App URL:

```json
// In spark-openapi.json
"servers": [
  {
    "url": "https://YOUR-FUNCTION-APP.azurewebsites.net/api",
    "description": "Production server"
  }
]
```

### Step 4: Upload to Teams Developer Portal

1. Go to https://dev.teams.microsoft.com
2. Click **"Apps"** → **"Import app"**
3. Upload `spark-copilot-agent.zip`
4. Accept any schema validation warnings (copilotAgents is a preview feature)
5. Click **"Import"** to add to your catalog

### Step 5: Publish to Your Organization

1. In Developer Portal, open your **SPARK Prompts** app
2. Click **"Publish"** → **"Publish to your org"**
3. Submit for admin approval (if required)
4. Once approved, the agent appears in Copilot's agent store

### Step 6: Test in Microsoft 365 Copilot

1. Open Microsoft 365 Copilot (copilot.microsoft.com or in Teams/Word/PowerPoint)
2. Click the **agent picker** (@)
3. Find **"SPARK Prompt Assistant"**
4. Start chatting!

Try these starter prompts:
- "Find marketing prompts for social media"
- "I need help with cold email outreach"
- "Show me beginner-friendly writing prompts"
- "What's in the Business department?"

## 🎨 Customization Options

### Modify Agent Personality

Edit `spark-declarative-agent.json`:

```json
{
  "instructions": "You are SPARK, a friendly AI prompt consultant..."
}
```

### Add More Functions

Extend `spark-plugin.json` with additional capabilities:

```json
{
  "name": "analyzePromptEffectiveness",
  "description": "Analyze which prompts work best for specific use cases"
}
```

### Customize Adaptive Cards

The plugin includes beautiful formatted cards. Modify templates in `spark-plugin.json` under each function's `response_semantics.static_template`.

### Change Branding

Update manifest colors, names, and icons:

```json
{
  "accentColor": "#YOUR_COLOR",
  "name": {
    "short": "Your Brand Name"
  }
}
```

## 🔒 Security & Authentication

### Current Setup (Anonymous)

The deployed version uses anonymous authentication suitable for internal company use:

```json
{
  "auth": {
    "type": "None"
  }
}
```

### Adding Authentication

For production with external users:

1. **Update OpenAPI Spec:**
```json
{
  "auth": {
    "type": "OAuthPluginVault",
    "reference_id": "YOUR_AZURE_AD_APP_ID"
  }
}
```

2. **Configure Azure AD:**
   - Register app in Azure AD
   - Add API permissions for Microsoft Graph
   - Configure redirect URIs
   - Update Function App with OAuth validation

3. **Extract User Identity:**
```typescript
function getUserId(request: HttpRequest): string {
  const token = request.headers.get('authorization');
  // Decode JWT and extract user ID
  return decodeToken(token).sub;
}
```

## 📊 Monitoring & Analytics

### View Usage in Azure

```bash
# Check Function App logs
az monitor app-insights query \
  --app YOUR_APP_INSIGHTS \
  --analytics-query "requests | summarize count() by operation_Name"
```

### Track Popular Prompts

Add analytics to your API:

```typescript
// Log which prompts are accessed most
context.log('Prompt viewed:', {
  promptId,
  userId,
  timestamp: new Date()
});
```

## 🚨 Troubleshooting

### Agent Doesn't Appear in Copilot

**Issue**: SPARK agent not visible in agent picker

**Solutions:**
1. Check manifest version is 1.19: `"manifestVersion": "1.19"`
2. Verify `copilotAgents` section is present
3. Confirm app is published to your org
4. Wait 24 hours for deployment propagation
5. Check Teams admin center for app approval status

### API Calls Failing

**Issue**: Agent says "I'm unable to access the prompt library right now"

**Solutions:**
1. Verify Function App is running: `az functionapp show --name spark-copilot-api`
2. Test API directly: `curl https://YOUR-APP.azurewebsites.net/api/prompts/search?query=test`
3. Check CORS is enabled for Copilot domains
4. Review Function App logs for errors
5. Ensure `prompts_index.json` is accessible

### Adaptive Cards Not Displaying

**Issue**: Prompts show as plain text instead of formatted cards

**Solutions:**
1. Validate JSON in `spark-plugin.json` Adaptive Card templates
2. Test cards at https://adaptivecards.io/designer
3. Ensure `response_semantics` structure is correct
4. Check data paths match your API response structure

### Recommendations Not Relevant

**Issue**: Agent recommends unrelated prompts

**Solutions:**
1. Improve keyword matching in `recommendPrompts` function
2. Add more contextual signals (industry, department preferences)
3. Implement machine learning scoring (Azure Cognitive Search)
4. Build user preference tracking

## 🎓 Advanced Features

### Add AI-Powered Search

Integrate Azure Cognitive Search for semantic search:

```typescript
import { SearchClient } from '@azure/search-documents';

const searchClient = new SearchClient(endpoint, 'prompts-index', credential);
const results = await searchClient.search(query, {
  searchMode: 'all',
  queryType: 'semantic'
});
```

### Implement Prompt Analytics

Track which prompts drive the most value:

```typescript
// Store prompt usage events
await cosmos Container.items.create({
  promptId,
  userId,
  timestamp,
  context: useCase,
  helpful: true
});
```

### Create Prompt Collections

Let users create themed collections:

```json
{
  "name": "createPromptCollection",
  "description": "Create a custom collection of related prompts"
}
```

## 📚 Additional Resources

- [Microsoft 365 Copilot Extensibility Docs](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/)
- [Declarative Agents Overview](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/overview-declarative-agent)
- [API Plugin Development](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/overview-api-plugins)
- [Adaptive Cards Designer](https://adaptivecards.io/designer)
- [Teams App Manifest Schema](https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema)

## 🎉 Success Metrics

Track these KPIs to measure impact:

1. **Adoption Rate**: % of employees using SPARK agent
2. **Engagement**: Average prompts viewed per user per week
3. **Time Saved**: Reduction in time spent searching for prompts
4. **Favorites**: Number of prompts saved to favorites
5. **Recommendations**: Click-through rate on recommended prompts
6. **Department Coverage**: Which departments get most usage

## 💡 Future Enhancements

### Phase 2 Ideas:

1. **Prompt Customization**: Let users modify prompts inline
2. **Version History**: Track prompt changes over time
3. **Collaboration**: Share favorite prompts with team members
4. **Templates**: Pre-filled prompts with variable placeholders
5. **Feedback Loop**: "Was this prompt helpful?" rating system
6. **Smart Suggestions**: Proactive recommendations based on current work
7. **Integration**: Connect to other tools (Notion, Jira, SharePoint)

## 🤝 Support

For issues or questions:

1. Check troubleshooting section above
2. Review Azure Function logs
3. Test API endpoints directly
4. Validate manifest at https://dev.teams.microsoft.com

## 📝 License & Credits

**SPARK AI Prompt Library**
Serrala Program for AI Research & Knowledge

Built with love for enterprise AI adoption 🚀

---

**Need Help?** Contact your IT administrator or the SPARK development team.

**Deployment Date**: {{{date}}}
**Version**: 1.0.1
**Last Updated**: October 27, 2025
