# Microsoft Deployment Options for SPARK AI Prompt Library

**Research Date:** October 21, 2025
**Prepared For:** Peter Wolf
**Prepared By:** Nicholas Westburg
**Purpose:** Address deployment questions from demo meeting with CEO and IT leadership

---

## Executive Summary

This document provides comprehensive research on **5 Microsoft-native deployment options** for the SPARK AI Prompt Library, addressing the critical question:

> **"If we didn't have a GitHub repository, how would we host this code? Where would we put it?"** - Peter Wolf

All options below are **Microsoft-native solutions** that do not require GitHub Enterprise, though some offer GitHub integration as an optional enhancement.

---

## Table of Contents

1. [Option 1: Azure Static Web Apps](#option-1-azure-static-web-apps)
2. [Option 2: SharePoint Framework (SPFx) Web Part](#option-2-sharepoint-framework-spfx-web-part)
3. [Option 3: Microsoft Teams Tab Application](#option-3-microsoft-teams-tab-application)
4. [Option 4: Azure App Service](#option-4-azure-app-service)
5. [Option 5: On-Premises IIS Server](#option-5-on-premises-iis-server)
6. [Comparison Matrix](#comparison-matrix)
7. [Recommendations](#recommendations)
8. [Cost Analysis](#cost-analysis)
9. [Implementation Roadmap](#implementation-roadmap)

---

## Option 1: Azure Static Web Apps

### Overview
Azure Static Web Apps is a modern cloud service designed specifically for hosting static web applications with optional serverless APIs. It's Microsoft's **recommended solution for React applications**.

### Technical Details

**What It Is:**
- Managed hosting service for static sites (HTML, CSS, JavaScript)
- Built-in serverless Azure Functions for backend APIs
- Automatic global CDN distribution
- Native CI/CD integration (GitHub, Azure DevOps, or manual deployment)

**Current Stack Compatibility:**
- ✅ **React 18** (SPARK frontend) - Full support
- ✅ **Vite** build system - Full support
- ✅ **Express.js API** - Can be migrated to Azure Functions
- ✅ **JSON database** - Works perfectly (can be stored in Azure Blob Storage)

### Deployment Process

**Step 1: Prepare Application**
```bash
# Build React frontend
npm run build

# Output directory: dist/
```

**Step 2: Create Static Web App (Azure Portal)**
1. Navigate to Azure Portal → Create Resource → Static Web App
2. Select subscription and resource group
3. Choose deployment method:
   - **Azure DevOps** (no GitHub needed)
   - **Manual upload** (zip file)
   - **Local Git** (Azure Repos)
4. Configure build settings:
   - App location: `/`
   - API location: `/api` (for Azure Functions)
   - Output location: `dist`
5. Deploy

**Step 3: Configure API Backend**
- Option A: Migrate Express routes to Azure Functions
- Option B: Deploy Express API to separate Azure App Service
- Option C: Keep API on-premises and use Azure Private Link

**Step 4: Custom Domain (Optional)**
- Add custom domain (e.g., `spark.yourcompany.com`)
- Free SSL/TLS certificate automatically provisioned
- DNS validation via TXT record (as of Sept 2025)

### Authentication & Security

**Built-in Authentication:**
- Microsoft Entra ID (Azure AD)
- Azure AD B2C
- GitHub, Twitter, Google (optional)
- Custom OpenID Connect providers

**Enterprise Features:**
- Role-based access control (RBAC)
- Integrated with Microsoft 365 identity
- Automatic HTTPS enforcement
- DDoS protection included

### Pros

✅ **Easiest Microsoft cloud deployment**
✅ **Lowest cost** (Free tier available, Standard ~$9/month)
✅ **Automatic global CDN** (fast worldwide)
✅ **Zero server management** (fully managed)
✅ **Automatic SSL certificates** (free)
✅ **Built-in authentication** (Microsoft 365 integration)
✅ **CI/CD without GitHub** (Azure DevOps or manual)
✅ **Scales automatically** (no capacity planning)
✅ **99.95% uptime SLA** (Standard tier)

### Cons

⚠️ **API migration required** (Express → Azure Functions)
⚠️ **JSON file database** (needs migration to Blob Storage or Cosmos DB)
⚠️ **Limited backend control** (serverless constraints)
⚠️ **Cold start delays** (API functions may have 1-2 second delay on first request)

### Cost Breakdown

| Tier | Price/Month | Bandwidth | Features |
|------|-------------|-----------|----------|
| **Free** | $0 | 100 GB/month | 2 apps, basic auth |
| **Standard** | ~$9 | 100 GB/month | Unlimited apps, custom domains, SLA |
| **Additional Bandwidth** | $0.20/GB | Beyond 100 GB | Pay-as-you-go |

**Estimated Monthly Cost for SPARK:** $0-$9 (Free tier likely sufficient for internal use)

### Deployment Timeline

- **Setup:** 1-2 hours
- **API Migration:** 1-2 days (if migrating Express to Functions)
- **Testing:** 1-2 days
- **Total:** 3-5 days

### Best For

- ✅ Internal employee portals
- ✅ Fast global deployment
- ✅ Minimal IT overhead
- ✅ Integration with Microsoft 365

---

## Option 2: SharePoint Framework (SPFx) Web Part

### Overview
SharePoint Framework allows you to build **custom web parts** that run natively inside SharePoint Online sites, making prompts available directly in the existing SharePoint environment.

### Technical Details

**What It Is:**
- Custom React components that run inside SharePoint pages
- No separate hosting infrastructure needed
- Deployed via SharePoint App Catalog
- Accessed from any SharePoint site in the tenant

**Current Stack Compatibility:**
- ⚠️ **React 17** (SPFx limitation - cannot use React 18 yet)
- ✅ **Fluent UI v9** (compatible with SPFx)
- ⚠️ **Vite** - Must use SPFx build toolchain (Webpack-based)
- ✅ **REST API** - Can call external APIs or SharePoint lists

**Important Limitation:**
As of September 2025, SPFx is **locked to React 17** due to SharePoint Online's internal dependencies. Microsoft acknowledges this needs to be addressed, but no timeline yet.

### Deployment Process

**Step 1: Convert SPARK to SPFx Web Part**
```bash
# Install SPFx generator
npm install -g yo @microsoft/generator-sharepoint

# Create new SPFx project
yo @microsoft/sharepoint

# Migrate React components (downgrade to React 17)
# Update imports to use SPFx context
```

**Step 2: Package Solution**
```bash
# Bundle and package
gulp bundle --ship
gulp package-solution --ship

# Output: sharepoint/solution/spark-prompts.sppkg
```

**Step 3: Deploy to SharePoint**
1. **Upload to App Catalog:**
   - Navigate to SharePoint Admin Center
   - Go to "More features" → "Apps" → "App Catalog"
   - Upload `spark-prompts.sppkg`
   - Check "Make this solution available to all sites" (tenant-wide)
   - Deploy (takes 20-30 minutes to propagate)

2. **Add to SharePoint Site:**
   - Navigate to any SharePoint site
   - Edit page → Add web part → Search "SPARK"
   - Add SPARK Prompt Library web part to page

**Step 4: Configure API Backend**
- Option A: Store prompts in SharePoint Lists (native storage)
- Option B: Call external Express API (CORS configuration required)
- Option C: Use SharePoint REST API with JSON stored in document library

### Authentication & Security

**Automatic Authentication:**
- Uses SharePoint user's identity (no separate login)
- Inherits SharePoint permissions
- Can check user's department/role via Microsoft Graph API
- Integration with Microsoft 365 groups and Teams

**Data Storage Options:**
1. **SharePoint Lists** (recommended for SPFx)
2. **SharePoint Document Library** (for JSON files)
3. **External API** (your existing Express server)

### Pros

✅ **No additional hosting costs** (runs on SharePoint)
✅ **Native SharePoint integration** (familiar UI for users)
✅ **Automatic authentication** (inherits SharePoint login)
✅ **Easy deployment** (upload .sppkg file)
✅ **Available in existing SharePoint sites** (no new URL)
✅ **IT already manages SharePoint** (no new infrastructure)
✅ **Offline capability** (SharePoint mobile app)
✅ **Version control** (SharePoint app versioning)

### Cons

⚠️ **Major code refactoring required** (React 18 → React 17)
⚠️ **Different build system** (Vite → Webpack)
⚠️ **SharePoint performance constraints** (slower than dedicated hosting)
⚠️ **Limited customization** (must fit SharePoint page layout)
⚠️ **API migration** (Express → SharePoint REST or external)
⚠️ **Deployment approval** (requires SharePoint admin rights)
⚠️ **30-minute propagation delay** (app catalog deployment)
⚠️ **React version locked** (cannot use latest React features)

### Cost Breakdown

**Included in Microsoft 365:**
- No additional hosting costs
- Uses existing SharePoint Online licensing
- No separate infrastructure to maintain

**Development Cost:**
- **Code refactoring:** 2-3 weeks (downgrade React, restructure app)
- **Testing:** 1 week
- **Documentation:** 2-3 days

### Deployment Timeline

- **SPFx Setup:** 1 day
- **Code Migration:** 2-3 weeks (React 18 → 17, Vite → Webpack)
- **App Catalog Deployment:** 30 minutes
- **Testing:** 1 week
- **Total:** 3-4 weeks

### Best For

- ✅ Organizations heavily invested in SharePoint
- ✅ Users who work primarily in SharePoint daily
- ✅ No budget for additional hosting
- ✅ Tight IT security requirements (no external hosting)

---

## Option 3: Microsoft Teams Tab Application

### Overview
Deploy SPARK as a **custom tab** inside Microsoft Teams, making prompts accessible directly where employees collaborate and use M365 Copilot.

### Technical Details

**What It Is:**
- Custom React app that runs as a tab inside Teams channels or personal apps
- Hosted on Azure (Static Web Apps or App Service)
- Integrated with Teams identity and permissions
- Can use Microsoft Graph API for user context

**Current Stack Compatibility:**
- ✅ **React 18** - Full support
- ✅ **Vite** - Full support
- ✅ **Express.js API** - Can be deployed to Azure App Service
- ✅ **M365 Copilot integration** - Already built in Tampermonkey script

**Integration with Existing Tampermonkey:**
- SPARK Teams tab + Tampermonkey integration = seamless workflow
- User opens Teams tab to browse prompts
- Clicks "Copy to Copilot" → Opens Copilot with prompt pre-filled
- Best of both worlds: native Teams app + browser extension

### Deployment Process

**Step 1: Prepare Teams App Manifest**
```json
{
  "manifestVersion": "1.16",
  "id": "spark-prompt-library-uuid",
  "version": "1.0.0",
  "name": {
    "short": "SPARK Prompts",
    "full": "SPARK AI Prompt Library"
  },
  "description": {
    "short": "2,400+ professional AI prompts",
    "full": "Comprehensive prompt library for M365 Copilot"
  },
  "developer": {
    "name": "Your Company",
    "websiteUrl": "https://spark.yourcompany.com",
    "privacyUrl": "https://spark.yourcompany.com/privacy",
    "termsOfUseUrl": "https://spark.yourcompany.com/terms"
  },
  "staticTabs": [
    {
      "entityId": "spark-tab",
      "name": "SPARK Library",
      "contentUrl": "https://spark.yourcompany.com",
      "scopes": ["personal"]
    }
  ],
  "permissions": ["identity", "messageTeamMembers"],
  "validDomains": ["spark.yourcompany.com"]
}
```

**Step 2: Host React App**
- Deploy to Azure Static Web Apps (Option 1)
- OR deploy to Azure App Service (Option 4)
- Ensure custom domain is configured (required for Teams)

**Step 3: Configure Teams JavaScript SDK**
```javascript
// Add to SPARK app
import * as microsoftTeams from "@microsoft/teams-js";

// Initialize Teams context
microsoftTeams.app.initialize();

// Get user context (department, email, etc.)
const context = await microsoftTeams.app.getContext();
```

**Step 4: Upload to Teams**
1. **Create app package:**
   - `manifest.json` (app definition)
   - `color.png` (192x192 icon)
   - `outline.png` (32x32 icon)
   - Zip all three files

2. **Upload to Teams:**
   - **For Testing:** Teams → Apps → "Upload a custom app"
   - **For Production:** Submit to IT admin for tenant-wide deployment

**Step 5: Admin Approval (Production)**
- IT admin uploads app to Teams Admin Center
- Assigns app to users/departments
- Sets policies (which users can access)
- App appears in users' Teams sidebar

### Authentication & Security

**Automatic SSO:**
- Users automatically signed in via Microsoft 365
- No separate login required
- Token-based authentication with Microsoft Graph
- Can access user's department, role, email

**Important Security Note (from research):**
- Use custom subdomain (not default `*.azure.net`)
- Configure redirect URIs early in development
- Test in Teams desktop, Teams web, and standalone browser
- Implement proper token handling for Graph API calls

### Pros

✅ **Native Teams integration** (users already work in Teams)
✅ **Automatic SSO** (Microsoft 365 identity)
✅ **Complements Tampermonkey** (tab for browsing, button for Copilot)
✅ **Mobile support** (Teams mobile app)
✅ **Department-based access** (can restrict by user attributes)
✅ **Minimal code changes** (React app stays mostly the same)
✅ **Centralized discovery** (users find it in Teams app store)
✅ **Usage analytics** (Teams admin center)

### Cons

⚠️ **Requires Azure hosting** (Static Web Apps or App Service)
⚠️ **Custom domain required** (can't use Azure default domain)
⚠️ **IT admin approval** (for tenant-wide deployment)
⚠️ **Manifest submission process** (can take 24 hours)
⚠️ **Teams SDK integration** (additional development)
⚠️ **Testing complexity** (desktop, web, mobile clients)

### Cost Breakdown

**Hosting:**
- Azure Static Web Apps: $0-$9/month (same as Option 1)
- Custom domain: $10-$15/year (optional, can use Azure subdomain for testing)

**Development:**
- Teams SDK integration: 2-3 days
- Manifest creation: 1 day
- Testing: 2-3 days

### Deployment Timeline

- **Teams SDK Integration:** 2-3 days
- **Manifest Creation:** 1 day
- **Azure Hosting Setup:** 1-2 days (using Static Web Apps)
- **Testing:** 2-3 days
- **Admin Approval:** 24 hours - 1 week
- **Total:** 1-2 weeks

### Best For

- ✅ Organizations using Teams heavily
- ✅ Users who work in Teams all day
- ✅ Complement to Tampermonkey integration
- ✅ Mobile access needed
- ✅ Want centralized app discovery

---

## Option 4: Azure App Service

### Overview
Azure App Service is Microsoft's traditional **Platform-as-a-Service (PaaS)** for hosting web applications. It provides full control over the Node.js/Express backend while handling infrastructure management.

### Technical Details

**What It Is:**
- Managed hosting for web applications (Node.js, .NET, Python, Java, PHP)
- Runs both frontend (React) and backend (Express) together
- Full control over server configuration
- Supports containerization (Docker)

**Current Stack Compatibility:**
- ✅ **React 18** - Full support
- ✅ **Vite** - Full support
- ✅ **Express.js API** - Native support (Node.js LTS 22 recommended)
- ✅ **JSON database** - Works perfectly (can scale to Azure Cosmos DB later)

### Deployment Process

**Step 1: Prepare Application**
```bash
# Build React frontend
npm run build

# Serve React from Express
# In server/api.js:
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

**Step 2: Deploy via Azure CLI**
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Create resource group
az group create --name spark-rg --location eastus

# Deploy app (one command!)
az webapp up \
  --name spark-prompt-library \
  --resource-group spark-rg \
  --runtime "NODE:22-lts" \
  --sku F1  # Free tier

# App deployed to: https://spark-prompt-library.azurewebsites.net
```

**Step 3: Configure Environment Variables**
```bash
az webapp config appsettings set \
  --name spark-prompt-library \
  --resource-group spark-rg \
  --settings \
    NODE_ENV=production \
    ADMIN_PASSWORD=YourSecurePassword \
    PORT=8080
```

**Step 4: Setup Continuous Deployment (Optional)**
- **Azure DevOps:** Native integration
- **Local Git:** Push to Azure-hosted Git repo
- **Manual:** Upload zip file via Azure Portal

**Important:** Set `process.env.PORT` in Express server (Azure assigns port dynamically)

### Authentication & Security

**Options:**
1. **Microsoft Entra ID (Azure AD)** - Built-in authentication
2. **App Service Authentication** - No code changes required
3. **Custom authentication** - Use existing Express session/token system

**Configuration (Azure Portal):**
- Enable "App Service Authentication"
- Choose Microsoft identity provider
- Restrict access to company domain (e.g., @yourcompany.com)

### Pros

✅ **Minimal code changes** (deploy existing app as-is)
✅ **Full backend control** (Express stays unchanged)
✅ **Supports JSON database** (no migration required)
✅ **One-command deployment** (`az webapp up`)
✅ **Built-in scaling** (vertical and horizontal)
✅ **Deployment slots** (test before production)
✅ **99.95% SLA** (Standard tier)
✅ **Container support** (Docker if needed)
✅ **Easy rollback** (previous versions available)

### Cons

⚠️ **Higher cost than Static Web Apps** ($13-$55/month minimum)
⚠️ **Requires server management** (more than Static Web Apps)
⚠️ **No free tier for production** (Free tier has limitations)
⚠️ **Always-on requires Basic tier** ($13/month minimum)
⚠️ **Cold start on Free tier** (app sleeps after inactivity)

### Cost Breakdown

| Tier | Price/Month | Features | Use Case |
|------|-------------|----------|----------|
| **F1 (Free)** | $0 | 60 min/day, no SLA, cold start | Testing only |
| **B1 (Basic)** | ~$13 | Always-on, 1 core, 1.75 GB RAM | Small internal apps |
| **S1 (Standard)** | ~$70 | Auto-scale, staging slots, 99.95% SLA | Production |
| **P1V2 (Premium)** | ~$80 | Better performance, VNet integration | Enterprise |

**Estimated Monthly Cost for SPARK:** $13-$70 (Basic for small team, Standard for production)

### Deployment Timeline

- **Initial Setup:** 2-4 hours
- **Configuration:** 1-2 hours
- **Testing:** 1 day
- **Total:** 1-2 days

### Best For

- ✅ Want to deploy existing app with minimal changes
- ✅ Need full control over backend
- ✅ JSON database is sufficient (no migration needed)
- ✅ Budget allows $13-$70/month
- ✅ Want staging/production environments

---

## Option 5: On-Premises IIS Server

### Overview
Host SPARK on **Windows Server with Internet Information Services (IIS)**, keeping all infrastructure on-premises within the company's data center or private cloud.

### Technical Details

**What It Is:**
- Microsoft's web server for Windows Server
- Runs on company-owned hardware or private cloud
- Full control over infrastructure and data
- No dependency on external cloud services

**Current Stack Compatibility:**
- ✅ **React 18** - Served as static files
- ✅ **Vite build output** - Works perfectly
- ✅ **Express.js API** - Runs via IISNode or reverse proxy
- ✅ **JSON database** - Stored on local file system

**Two Deployment Approaches:**

**Approach A: Static Files Only (Frontend)**
- Build React app → Deploy `dist/` folder to IIS
- API remains on separate Node.js server (on-premises or cloud)

**Approach B: Full Stack (Frontend + Backend)**
- Use **iisnode** to run Node.js/Express through IIS
- Single server handles both React frontend and Express API

### Deployment Process

**Step 1: Prepare Windows Server**
```powershell
# Enable IIS feature
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole

# Install additional features
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpCompressionStatic
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpRedirect
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebSockets
```

**Step 2: Install URL Rewrite Module**
- Download from: https://www.iis.net/downloads/microsoft/url-rewrite
- Required for React Router (single-page app routing)

**Step 3: Build React App**
```bash
npm run build
# Output: dist/ folder
```

**Step 4: Create IIS Website**
```powershell
# Create site in IIS Manager
New-IISSite -Name "SPARK Prompt Library" `
  -PhysicalPath "C:\inetpub\wwwroot\spark" `
  -BindingInformation "*:80:spark.internal.company.com"
```

**Step 5: Configure URL Rewrite (Critical for SPAs)**

Create `web.config` in `dist/` folder:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Router" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
  </system.webServer>
</configuration>
```

**Step 6: Deploy Express API (Option B - Full Stack)**

Install iisnode:
```powershell
# Download iisnode from GitHub
# https://github.com/Azure/iisnode
# Install MSI package
```

Configure IIS to run Node.js:
```xml
<!-- In web.config -->
<handlers>
  <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
</handlers>
```

**Step 7: Set Permissions**
```powershell
# Grant IUSR account access to folder
icacls "C:\inetpub\wwwroot\spark" /grant "IUSR:(OI)(CI)F" /T
```

### Authentication & Security

**Windows Authentication:**
- Integrate with Active Directory
- Users automatically authenticated via Windows credentials
- No separate login required

**Configuration:**
```powershell
# Enable Windows Authentication in IIS
Set-WebConfigurationProperty `
  -Filter "/system.webServer/security/authentication/windowsAuthentication" `
  -Name Enabled `
  -Value True `
  -PSPath "IIS:\Sites\SPARK Prompt Library"

# Disable Anonymous Authentication
Set-WebConfigurationProperty `
  -Filter "/system.webServer/security/authentication/anonymousAuthentication" `
  -Name Enabled `
  -Value False `
  -PSPath "IIS:\Sites\SPARK Prompt Library"
```

**SSL/TLS Certificate:**
- Use company's internal certificate authority
- OR use Let's Encrypt (free) for public-facing sites
- Configure HTTPS binding in IIS Manager

### Pros

✅ **Complete data control** (everything on-premises)
✅ **No cloud costs** (only hardware/infrastructure)
✅ **Integrated with Active Directory** (Windows auth)
✅ **IT familiar with IIS** (existing expertise)
✅ **No internet dependency** (works on internal network)
✅ **Compliance friendly** (data never leaves premises)
✅ **Unlimited storage** (local file system)
✅ **Full customization** (complete server control)

### Cons

⚠️ **IT team must manage server** (updates, patches, maintenance)
⚠️ **No automatic scaling** (manual capacity planning)
⚠️ **Hardware costs** (server, storage, network)
⚠️ **Backup responsibility** (company must handle backups)
⚠️ **No automatic SSL** (manual certificate management)
⚠️ **Remote access complexity** (VPN required for external access)
⚠️ **Single point of failure** (unless HA setup)
⚠️ **Slower deployment** (manual file copy, IIS restart)

### Cost Breakdown

**Initial Setup:**
- Windows Server license: $500-$6,000 (depending on edition)
- Hardware: $2,000-$10,000 (or use existing server)
- SSL certificate: $0-$200/year (free with Let's Encrypt or internal CA)

**Ongoing Costs:**
- Electricity/cooling: ~$50-$200/month (for dedicated server)
- IT maintenance: Included in existing IT staff budget
- Backup storage: Varies (tape, NAS, cloud backup)

**OR Cloud-Hosted Windows Server:**
- Azure VM (Windows Server): $70-$300/month
- Still "on-premises" approach but in cloud infrastructure

### Deployment Timeline

- **Windows Server Setup:** 1 day (if new server needed)
- **IIS Configuration:** 2-4 hours
- **React App Deployment:** 1-2 hours
- **URL Rewrite Setup:** 1 hour
- **Testing:** 1-2 days
- **Total:** 2-3 days (or 1 week if new server)

### Best For

- ✅ Strict data residency requirements
- ✅ No cloud infrastructure allowed
- ✅ Existing Windows Server infrastructure
- ✅ IT team experienced with IIS
- ✅ Internal-only application (no external access needed)
- ✅ Budget for hardware/maintenance

---

## Comparison Matrix

| Criteria | Azure Static Web Apps | SharePoint SPFx | Teams Tab | Azure App Service | IIS On-Premises |
|----------|---------------------|----------------|-----------|------------------|-----------------|
| **Deployment Speed** | ⚡⚡⚡ 3-5 days | 🐢 3-4 weeks | ⚡⚡ 1-2 weeks | ⚡⚡⚡ 1-2 days | ⚡⚡ 2-3 days |
| **Code Changes Required** | Medium (API migration) | High (React downgrade) | Low | Minimal | Minimal |
| **Monthly Cost** | $0-$9 | $0 (included) | $0-$9 | $13-$70 | $0 (hardware owned) |
| **Ease of Deployment** | ⭐⭐⭐⭐⭐ Very Easy | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐ Easy | ⭐⭐⭐⭐⭐ Very Easy | ⭐⭐⭐ Moderate |
| **Scalability** | ⭐⭐⭐⭐⭐ Automatic | ⭐⭐⭐ Limited | ⭐⭐⭐⭐⭐ Automatic | ⭐⭐⭐⭐⭐ Automatic | ⭐⭐ Manual |
| **IT Maintenance** | ⭐⭐⭐⭐⭐ Zero | ⭐⭐⭐⭐ Low | ⭐⭐⭐⭐ Low | ⭐⭐⭐ Moderate | ⭐⭐ High |
| **Data Control** | ⭐⭐⭐ Cloud (Azure) | ⭐⭐⭐⭐ M365 tenant | ⭐⭐⭐ Cloud (Azure) | ⭐⭐⭐ Cloud (Azure) | ⭐⭐⭐⭐⭐ On-premises |
| **M365 Integration** | ⭐⭐⭐ Good (auth) | ⭐⭐⭐⭐⭐ Native | ⭐⭐⭐⭐⭐ Native | ⭐⭐⭐ Good (auth) | ⭐⭐ Custom |
| **Mobile Access** | ⭐⭐⭐⭐⭐ Yes | ⭐⭐⭐⭐ SharePoint app | ⭐⭐⭐⭐⭐ Teams app | ⭐⭐⭐⭐⭐ Yes | ⭐⭐ VPN required |
| **GitHub Dependency** | ❌ No (optional) | ❌ No | ❌ No (optional) | ❌ No (optional) | ❌ No |
| **Offline Support** | ❌ No | ⭐⭐⭐ SharePoint sync | ⭐⭐⭐ Teams offline | ❌ No | ✅ Intranet only |
| **Setup Complexity** | ⭐⭐⭐⭐⭐ Very Low | ⭐⭐ High | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐⭐ Very Low | ⭐⭐⭐ Moderate |
| **Best For** | Fast deployment | SharePoint-first orgs | Teams-first orgs | Minimal changes | Data control |

**Legend:**
- ⭐⭐⭐⭐⭐ Excellent
- ⭐⭐⭐⭐ Good
- ⭐⭐⭐ Average
- ⭐⭐ Below Average
- ⭐ Poor

---

## Recommendations

### Recommended Approach: **Phased Deployment**

Based on the research and your specific requirements, I recommend a **phased approach**:

---

### **Phase 1: Quick Win (1-2 Weeks)**
**Deploy to Azure Static Web Apps**

**Why:**
- Fastest time to production (3-5 days)
- Lowest cost ($0-$9/month)
- Zero infrastructure management
- Automatic SSL, CDN, and scaling
- Easy to integrate with Microsoft 365 authentication

**What to do:**
1. Deploy React frontend to Azure Static Web Apps (FREE tier)
2. Keep Express API on current development server temporarily
3. Configure CORS to allow Static Web App to call API
4. Add Microsoft Entra ID authentication
5. Demonstrate to leadership within 1 week

**Benefits:**
- ✅ Quick demonstration for CEO and IT leadership
- ✅ Validates cloud deployment approach
- ✅ No code changes required initially
- ✅ Can be done in parallel with other options

---

### **Phase 2: Production Enhancement (2-4 Weeks)**
**Add Microsoft Teams Tab Integration**

**Why:**
- Users already work in Teams all day
- Natural integration point for M365 Copilot workflow
- Complements existing Tampermonkey browser extension
- Mobile access via Teams app

**What to do:**
1. Add Teams JavaScript SDK to React app (~2 days)
2. Create Teams app manifest (~1 day)
3. Deploy as Teams personal app (uses Azure Static Web App as backend)
4. Submit to IT admin for tenant-wide deployment
5. Users access SPARK via Teams sidebar

**Benefits:**
- ✅ Native Teams experience
- ✅ Automatic SSO (Microsoft 365)
- ✅ Mobile support included
- ✅ Reuses Phase 1 infrastructure (same Azure Static Web App)

---

### **Phase 3: Long-Term Optimization (1-2 Months)**
**Migrate API to Azure Functions OR Deploy to SharePoint (Choose based on feedback)**

**Option A: Azure Functions (if staying cloud-native)**
- Migrate Express routes to serverless functions
- Store prompts in Azure Cosmos DB or Blob Storage
- Fully integrated with Static Web Apps
- True serverless architecture

**Option B: SharePoint SPFx (if IT prefers SharePoint-first)**
- Convert React app to SPFx web part
- Store prompts in SharePoint Lists
- Deploy to SharePoint App Catalog
- Fully integrated with SharePoint ecosystem

**Decision Point:**
- Ask IT leadership which they prefer based on Phase 1-2 results
- Both options work, depends on organizational preference

---

### **Alternative: If Cloud is Not Allowed**
**Deploy to On-Premises IIS**

If compliance or security requirements prevent cloud deployment:

1. Set up Windows Server with IIS (2-3 days)
2. Deploy React build to IIS (`dist/` folder)
3. Configure URL Rewrite for React Router
4. Run Express API via iisnode OR separate Node.js process
5. Integrate with Active Directory for authentication
6. Configure internal DNS (e.g., `spark.internal.company.com`)

**Timeline:** 1 week
**Cost:** $0 (use existing infrastructure)

---

## Cost Analysis

### 3-Year Total Cost of Ownership (TCO)

| Option | Year 1 | Year 2 | Year 3 | 3-Year Total | Notes |
|--------|--------|--------|--------|--------------|-------|
| **Azure Static Web Apps** | $108 | $108 | $108 | **$324** | $9/month (Standard tier) |
| **SharePoint SPFx** | $0 | $0 | $0 | **$0** | Included in M365 license |
| **Teams Tab** | $108 | $108 | $108 | **$324** | Uses Static Web Apps |
| **Azure App Service** | $840 | $840 | $840 | **$2,520** | $70/month (Standard tier) |
| **IIS On-Premises** | $2,000* | $50 | $50 | **$2,100** | *Initial hardware setup |

**Notes:**
- Static Web Apps and Teams Tab are the **lowest cost cloud options** ($324 over 3 years)
- SharePoint SPFx is **free** but requires significant development effort (3-4 weeks)
- Azure App Service is **more expensive** but requires minimal code changes
- On-Premises IIS has **high upfront cost** but near-zero ongoing costs

**Development Cost Not Included:**
- Developer time for migration, testing, and deployment
- SharePoint SPFx has highest development cost (~3-4 weeks)
- Azure Static Web Apps has lowest development cost (~3-5 days)

---

## Implementation Roadmap

### **Week 1-2: Phase 1 - Azure Static Web Apps**

**Day 1-2:**
- [ ] Create Azure account (if not already available)
- [ ] Deploy React build to Azure Static Web Apps (FREE tier)
- [ ] Configure custom domain (optional)
- [ ] Test frontend functionality

**Day 3-4:**
- [ ] Configure CORS on Express API to allow Static Web App
- [ ] Test API connectivity from Static Web App
- [ ] Add Microsoft Entra ID authentication
- [ ] Test user login flow

**Day 5:**
- [ ] End-to-end testing (browse prompts, copy to Copilot, etc.)
- [ ] Fix any issues
- [ ] Document deployment process

**Deliverable:** Working SPARK deployment accessible via `https://spark-yourcompany.azurestaticapps.net`

---

### **Week 3-4: Phase 2 - Teams Tab Integration**

**Day 1-2:**
- [ ] Add Microsoft Teams JavaScript SDK to React app
- [ ] Test Teams context (user info, department, etc.)
- [ ] Update authentication to use Teams SSO

**Day 3:**
- [ ] Create Teams app manifest (`manifest.json`)
- [ ] Design Teams app icons (192x192 and 32x32)
- [ ] Package app as `.zip` file

**Day 4:**
- [ ] Upload app to Teams (personal testing)
- [ ] Test in Teams desktop client
- [ ] Test in Teams web client
- [ ] Test in Teams mobile app

**Day 5:**
- [ ] Submit app to IT admin for tenant-wide deployment
- [ ] Create user documentation
- [ ] Prepare demo for leadership

**Deliverable:** SPARK accessible as Teams personal app for all employees

---

### **Month 2-3: Phase 3 - Long-Term Optimization (Choose One)**

**Option A: Serverless Migration (Azure Functions)**

**Week 1:**
- [ ] Analyze Express API routes
- [ ] Design Azure Functions structure
- [ ] Set up Azure Functions project

**Week 2-3:**
- [ ] Migrate Express routes to Azure Functions
- [ ] Migrate JSON database to Azure Cosmos DB or Blob Storage
- [ ] Update React app to call Azure Functions

**Week 4:**
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Deploy to production

**Option B: SharePoint Integration (SPFx)**

**Week 1-2:**
- [ ] Set up SPFx development environment
- [ ] Downgrade React 18 → React 17
- [ ] Convert React app to SPFx web part

**Week 3-4:**
- [ ] Migrate prompts to SharePoint Lists
- [ ] Update API calls to use SharePoint REST API
- [ ] Test in local SharePoint workbench

**Week 5:**
- [ ] Package SPFx solution (`.sppkg` file)
- [ ] Upload to SharePoint App Catalog
- [ ] Deploy to pilot SharePoint site

**Week 6:**
- [ ] End-to-end testing
- [ ] User acceptance testing (UAT)
- [ ] Deploy tenant-wide

---

## Next Steps

### Immediate Actions (This Week):

1. **Get Azure Subscription Access**
   - Contact IT to provision Azure subscription
   - OR use existing company Azure tenant
   - Confirm billing/cost approval for $0-$9/month

2. **Choose Phase 1 Deployment Method**
   - **Recommended:** Azure Static Web Apps (fastest, cheapest)
   - **Alternative:** Azure App Service (if zero code changes required)
   - **Fallback:** On-Premises IIS (if cloud not allowed)

3. **Schedule Follow-Up with Peter**
   - Present this research document
   - Get approval for recommended approach
   - Confirm budget and timeline

4. **Prepare for Demo**
   - Build production React app (`npm run build`)
   - Test API connectivity
   - Document deployment steps

---

### Questions for IT Leadership:

Before proceeding, clarify the following with Wilfred (IT lead) and Oliver:

1. **Cloud Policy:**
   - Is Azure cloud hosting approved for internal applications?
   - Are there any compliance requirements preventing cloud deployment?
   - Do we need data residency in specific geographic region?

2. **Authentication:**
   - Should we integrate with Microsoft Entra ID (Azure AD)?
   - Do users need to be restricted by department?
   - Is single sign-on (SSO) required?

3. **Infrastructure:**
   - Do we have existing Azure subscription?
   - Is there budget for $9-$70/month hosting?
   - Do we have Windows Server available for IIS deployment (if needed)?

4. **Access:**
   - Should SPARK be accessible only on internal network?
   - Or accessible from anywhere (VPN or public internet)?
   - Do remote employees need access?

5. **Timeline:**
   - What is the urgency for production deployment?
   - Is there a specific deadline (e.g., company event, fiscal year, etc.)?
   - Can we do phased rollout (pilot → production)?

---

## Conclusion

**Summary:**

The research reveals **5 viable Microsoft-native deployment options**, each with distinct advantages:

1. **Azure Static Web Apps** - Fastest, cheapest, easiest (RECOMMENDED for Phase 1)
2. **SharePoint SPFx** - Zero hosting cost, but significant development effort
3. **Microsoft Teams Tab** - Best user experience for Teams-first organizations
4. **Azure App Service** - Minimal code changes, traditional hosting
5. **On-Premises IIS** - Complete data control, existing IT expertise

**Recommended Strategy:**

✅ **Phase 1:** Deploy to Azure Static Web Apps (1 week)
✅ **Phase 2:** Add Teams Tab integration (2 weeks)
✅ **Phase 3:** Optimize based on feedback (1-2 months)

**Total Time to Production:** 1 week for initial deployment, 1 month for full Teams integration

**Total Cost:** $0-$9/month (or $0 if choosing SharePoint SPFx long-term)

**Next Step:** Present this research to Peter and IT leadership for approval to proceed with Phase 1.

---

## References

### Official Microsoft Documentation

- Azure Static Web Apps: https://learn.microsoft.com/en-us/azure/static-web-apps/
- SharePoint Framework (SPFx): https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview
- Microsoft Teams Apps: https://learn.microsoft.com/en-us/microsoftteams/platform/
- Azure App Service: https://learn.microsoft.com/en-us/azure/app-service/
- IIS on Windows Server: https://learn.microsoft.com/en-us/iis/

### Research Sources (October 2025)

- Azure Static Web Apps React Deployment: Multiple sources from Microsoft Learn, Medium, GeeksforGeeks
- SharePoint Framework SPFx Roadmap (September 2025): Microsoft 365 Developer Blog
- Teams Tab App Integration (August 2025): Medium, Microsoft Learn
- Azure App Service Node.js Deployment: Microsoft Learn, Stack Overflow, Medium
- IIS React Deployment: LetsReact.org, DEV Community, Stack Overflow

---

**Document Version:** 1.0
**Last Updated:** October 21, 2025
**Prepared By:** Nicholas Westburg
**Reviewed By:** [Pending - Peter Wolf]
