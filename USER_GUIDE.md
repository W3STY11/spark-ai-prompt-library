# SPARK Prompt Library - Complete User Guide

## 🎯 What is SPARK?

SPARK (Serrala Program for AI Research & Knowledge) is your personal library of 2,425+ professional AI prompts. Access any prompt in seconds, customize it with variables, and send it directly to Microsoft 365 Copilot.

---

## 🚀 Getting Started in 3 Steps

### Step 1: Access the Library

Visit your SPARK library at:
```
http://localhost:3000
```
(Or your custom deployed URL)

### Step 2: Click the Floating Button

Look for the purple button in the bottom-right corner:
```
⚡ 2,425+ Prompts
```

This button:
- Works on EVERY page
- Can be dragged anywhere
- Opens the full prompt library

### Step 3: Browse and Use Prompts

1. Click the floating button
2. Search or browse 2,425+ prompts
3. Select a prompt
4. Customize if needed
5. Copy to Copilot!

---

## 📚 How to Use Prompts

### Method 1: Search for What You Need

**Example: Finding a marketing email prompt**

1. Click **⚡ 2,425+ Prompts** button
2. Type in search box: `"marketing email"`
3. See all matching prompts
4. Click a prompt to open it

### Method 2: Browse by Department

**Example: Finding business prompts**

1. Open the drawer (click floating button)
2. Look for prompts with **Business** badge
3. Scroll to find what you need
4. Click to open

### Method 3: Quick Access from Homepage

1. Go to homepage: `http://localhost:3000`
2. Click **Browse Library** button
3. Use filters and search

---

## 🎨 Customizing Prompts with Variables

Many prompts have **customizable variables** that you fill in to personalize the prompt.

### How to Spot Variable Prompts

Look for the badge:
```
🔷 2 variables
```

This means the prompt has 2 fields you can customize!

### Example: Marketing Email Prompt

**Step 1:** Select prompt with variables
```
Title: Professional Marketing Email Campaign
Badge: Business | 3 variables
```

**Step 2:** Fill in the form
```
Product Name: SPARK Library
Target Audience: Small business owners
Key Benefit: Save 10 hours/week
```

**Step 3:** See live preview
The prompt updates automatically with your values!

**Step 4:** Copy to Copilot
Click **"Copy to M365 Copilot"** button

---

## 🔗 M365 Copilot Integration

### What is Cross-Tab Integration?

SPARK can send prompts **directly** to your Microsoft 365 Copilot tab. No copy-paste needed!

### Setup (One-Time, 2 Minutes)

**Step 1: Install Tampermonkey**

Choose your browser:

- **Chrome/Edge**: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
- **Firefox**: https://addons.mozilla.org/firefox/addon/tampermonkey/
- **Safari**: https://apps.apple.com/us/app/tampermonkey/id1482490089

**Step 2: Install SPARK Receiver Script**

1. Click Tampermonkey icon → **Dashboard**
2. Click **+** (Create new script)
3. Delete everything in the editor
4. Copy contents from: `spark-copilot-receiver.user.js`
5. Paste into editor
6. Save (Ctrl+S or Cmd+S)
7. Close dashboard

**Step 3: Test It Works**

1. Open M365 Copilot: https://copilot.microsoft.com
2. Look for **"⚡ SPARK Ready"** badge (top-right)
3. If you see it, you're ready! 🎉

### How to Use Cross-Tab Integration

**Example Workflow:**

1. **Tab 1**: Open SPARK Library (`http://localhost:3000`)
2. **Tab 2**: Open M365 Copilot (`https://copilot.microsoft.com`)
3. **In SPARK**: Click floating button
4. **In SPARK**: Search "competitive analysis"
5. **In SPARK**: Select a prompt
6. **In SPARK**: Fill in variables:
   - Company: "Acme Corp"
   - Industry: "SaaS"
7. **In SPARK**: Click **"Copy to M365 Copilot"**
8. **In Copilot Tab**: ✅ Prompt appears automatically!
9. **In Copilot**: Press Enter to send

**Visual Feedback:**

- ✅ Toast message: "Prompt sent to M365 Copilot!"
- ✅ Copilot input fills automatically
- ✅ Ready to send with one click!

---

## ➕ How to Add Your Own Prompts

### Method 1: Using the Website (Easiest)

**From Homepage:**

1. Go to `http://localhost:3000`
2. Scroll down to find **"Add New Prompt"** button
3. Click it to open the form

**From Browse Page:**

1. Go to `http://localhost:3000/browse`
2. Click **"+ Add Prompt"** button (top-right)

**Fill Out the Form:**

```
Title: Give it a clear, descriptive title
Example: "Professional Cold Email Template"

Department: Choose from 9 departments
✓ Business  ✓ Marketing  ✓ Sales  ✓ Finance  ✓ SEO
✓ Education  ✓ Writing  ✓ Productivity  ✓ Solopreneurs

Description: What does this prompt do?
Example: "Creates professional cold outreach emails with high reply rates"

Content: The actual prompt text
Example: "Write a professional cold email to [TARGET AUDIENCE] about [PRODUCT]..."

Tags: Comma-separated keywords
Example: "email, outreach, cold-email, sales"

Tips (optional): How to use this prompt best
Example: "Best for B2B outreach. Personalize the first line."
```

**Using Variables in Your Prompts:**

Make prompts customizable by using `[VARIABLE]` format:

```
Bad (hardcoded):
"Write an email about our new product"

Good (with variables):
"Write an email to [TARGET AUDIENCE] about [PRODUCT NAME] highlighting [KEY BENEFIT]"
```

When users select this prompt, they'll see a form with 3 fields:
- Target Audience
- Product Name
- Key Benefit

**Submit:**

Click **"Add Prompt"** button. Done! Your prompt is now in the library.

### Method 2: Admin Dashboard (Full Control)

**Login:**

1. Go to `http://localhost:3000/admin-login`
2. Enter admin password (from `.env` file)
3. Click **Login**

**Add Prompt:**

1. In admin dashboard, click **"Add New Prompt"**
2. Fill out complete form with all metadata
3. Upload thumbnail images (optional)
4. Set complexity level
5. Save

**Bulk Import:**

For adding many prompts at once, see `BULK_IMPORT_GUIDE.md`

---

## ✏️ How to Edit Existing Prompts

### Using Admin Dashboard

**Step 1:** Login

```
http://localhost:3000/admin-login
```

**Step 2:** Find the prompt

- Use search box
- Filter by department
- Scroll through list

**Step 3:** Click **Edit** button

**Step 4:** Make your changes

- Edit any field
- Update variables
- Add/remove tags

**Step 5:** Save

Click **"Save Changes"**

✅ Automatic backup created before saving!

---

## 🔍 Search Tips & Tricks

### Basic Search

```
Type anything: "email template"
Searches: title, content, description, department
```

### Search by Department

```
Type: "marketing"
Shows: All Marketing department prompts
```

### Search by Variable

```
Type: "customizable" or "variable"
Shows: Prompts with variables
```

### Exact Phrases

```
Type: "competitive analysis"
Shows: Prompts with that exact phrase
```

---

## 💡 Real-World Use Cases

### Use Case 1: Daily Marketing Tasks

**Your Goal:** Create social media posts for the week

1. Click floating button
2. Search: "social media"
3. Select: "Weekly Social Media Content Calendar"
4. Fill variables:
   - Brand: "SPARK Library"
   - Industry: "B2B SaaS"
   - Topics: "AI productivity, prompt engineering"
5. Copy to Copilot
6. Generate content!

**Time Saved:** 3 hours → 5 minutes

### Use Case 2: Sales Outreach

**Your Goal:** Send 50 personalized cold emails

1. Find prompt: "B2B Cold Email Template"
2. Customize once with your product
3. Copy to Copilot
4. Use Copilot to generate 50 variations
5. Review and send

**Time Saved:** 8 hours → 30 minutes

### Use Case 3: Business Strategy

**Your Goal:** Quarterly competitive analysis

1. Search: "competitive analysis"
2. Select: "Comprehensive Market Analysis Framework"
3. Fill company and industry details
4. Copy to Copilot
5. Get instant analysis framework

**Time Saved:** 2 days → 20 minutes

---

## 🎓 Best Practices

### For Using Prompts

1. **Always customize variables** - Generic prompts = generic results
2. **Add context** - Include your industry, audience, goals
3. **Iterate** - Run prompt, review output, refine, repeat
4. **Combine prompts** - Use multiple prompts for complex tasks
5. **Save favorites** - Click ❤️ to bookmark best prompts

### For Adding Prompts

1. **Clear titles** - "Professional Cold Email" not "Email thing"
2. **Use variables** - Make it reusable: `[YOUR VARIABLE]`
3. **Add tips** - Help others use it effectively
4. **Tag thoroughly** - More tags = easier to find
5. **Test first** - Make sure prompt works before adding

### For Organizing

1. **Pick right department** - Makes browsing easier
2. **Specific tags** - "cold-email, B2B" not just "email"
3. **Good descriptions** - Explain what it does in 1-2 sentences
4. **Complexity level** - Beginner/Intermediate/Advanced

---

## ⚙️ Settings & Customization

### Moving the Floating Button

**Drag it anywhere!**
- Click and hold the button
- Drag to new position
- Release
- Position saves automatically

### Search Preferences

- **Recent searches** - Automatically saved
- **Filter persistence** - Department filters remember your choice
- **Sort order** - Saves your last sort preference

### Favorites System

- Click ❤️ on any prompt
- Access from: `http://localhost:3000/favorites`
- Synced across sessions (localStorage)

---

## 🐛 Common Issues & Solutions

### "No prompts showing in drawer"

**Solution:**
1. Check API is running: `http://localhost:3001/api/prompts`
2. Refresh the page (F5)
3. Check browser console for errors

### "Variables not detected"

**Solution:**
- Ensure format is exactly: `[VARIABLE NAME]`
- Not: `{variable}` or `<variable>` or `$variable`
- Use brackets: `[TARGET AUDIENCE]` ✓

### "Copy to Copilot doesn't work"

**Solution:**
1. Check "⚡ SPARK Ready" badge in Copilot tab
2. Reinstall Tampermonkey script
3. Use clipboard fallback: prompt is always copied

### "Floating button disappeared"

**Solution:**
- Refresh page (F5)
- Check you're on correct URL
- Button appears on all pages except /admin

---

## 📊 Stats & Insights

Access your usage statistics:

```
http://localhost:3000/admin
```

See:
- Total prompts by department
- Most used prompts
- Recent additions
- Data quality score

---

## 🔐 Security & Privacy

### Your Data is Private

- ✅ Self-hosted (runs on your machine)
- ✅ No external calls
- ✅ No tracking or analytics
- ✅ Your prompts stay yours

### Admin Access

- Password-protected admin dashboard
- Session-based authentication
- Automatic logout after inactivity
- Change password in `.env` file

### Backup System

- ✅ Auto-backup before every edit
- ✅ Auto-backup before every delete
- ✅ Manual backup anytime
- ✅ Located in `/backups` folder

---

## 📱 Mobile & Tablet Support

SPARK works on **all devices**:

- 📱 **Mobile** - Fully responsive UI
- 📱 **Tablet** - Optimized layouts
- 💻 **Desktop** - Full features

**Mobile Tips:**
- Tap and hold to drag button
- Swipe to scroll prompts
- Pinch to zoom on previews

---

## 🎯 Next Steps

Now that you know how to use SPARK:

1. ✅ Try the floating button
2. ✅ Browse some prompts
3. ✅ Customize one with variables
4. ✅ Add your first custom prompt
5. ✅ Set up M365 Copilot integration
6. ✅ Share with your team!

---

## 💬 Need Help?

- 📖 **Full Docs**: `CLAUDE.md`
- 🚀 **Deployment**: See deployment guide below
- 🔧 **Technical**: `MULTI_USER_ARCHITECTURE.md`
- 💾 **Bulk Import**: `BULK_IMPORT_GUIDE.md`

---

**Made with ⚡ by the SPARK Team**

Enjoy your 2,425+ professional AI prompts!
