# Bulk Import Guide - SPARK Prompt Library

This guide explains how to import multiple prompts at once using CSV or JSON files.

## Quick Access

**Admin Panel**: http://localhost:3000/admin-login
**Admin Password**: `sparkadmin2025`

## Template Files

Two template files are provided in this directory:
- `bulk_import_template.csv` - CSV format template
- `bulk_import_template.json` - JSON format template

## Method 1: CSV Import

### CSV Template Structure

```csv
title,department,subcategory,description,content,icon,tags,complexity,tips
"Prompt Title","Department","Subcategory","Brief description","Full prompt content","📧","tag1,tag2,tag3",2,"Tip 1;Tip 2;Tip 3"
```

### CSV Field Specifications

| Field | Type | Required | Format | Example |
|-------|------|----------|--------|---------|
| **title** | Text | ✅ Yes | Quoted string | "Email Marketing Campaign" |
| **department** | Text | ✅ Yes | Must match existing department | "Marketing" |
| **subcategory** | Text | ✅ Yes | Quoted string | "Email Marketing" |
| **description** | Text | ✅ Yes | Brief summary (1-2 sentences) | "Create compelling email campaigns" |
| **content** | Text | ✅ Yes | Full prompt text with placeholders | "You are a marketing expert..." |
| **icon** | Emoji | ❌ No | Single emoji character | "📧" |
| **tags** | Text | ❌ No | Comma-separated (no spaces) | "email,marketing,campaign" |
| **complexity** | Number | ❌ No | 1 (Easy), 2 (Medium), 3 (Advanced) | 2 |
| **tips** | Text | ❌ No | Semicolon-separated tips | "Tip 1;Tip 2;Tip 3" |

### Valid Departments (Must Use Exact Names)

- **Business** (💼)
- **Marketing** (📢)
- **Sales** (💰)
- **SEO** (🔍)
- **Finance** (💵)
- **Education** (📚)
- **Writing** (✍️)
- **Productivity** (⚡)
- **Solopreneurs** (🚀)

### CSV Import Steps

1. **Open Admin Panel**: Navigate to http://localhost:3000/admin-login
2. **Login**: Use password `sparkadmin2025`
3. **Scroll to Bulk Import Section**: Click "Bulk Import Prompts"
4. **Choose CSV File**:
   - Use the template file: `bulk_import_template.csv`
   - Or create your own following the template structure
5. **Click "Import Prompts"**
6. **Review Results**: Check success/error messages

### CSV Tips

- Always quote text fields that contain commas or special characters
- Use semicolons (`;`) to separate multiple tips
- Use commas (`,`) to separate tags (no spaces)
- Keep content concise but detailed
- Use `[PLACEHOLDERS]` for user inputs in prompts
- Complexity: 1 = Easy, 2 = Medium, 3 = Advanced

### CSV Example Row

```csv
"Email Marketing Campaign","Marketing","Email Marketing","Create compelling email campaigns for product launches","You are a marketing expert. Create an email campaign for [PRODUCT NAME] targeting [AUDIENCE]. Include: 1) Subject lines (5 variations) 2) Email body copy 3) Call-to-action 4) Follow-up sequence","📧","email,marketing,campaign,copywriting",2,"Use A/B testing for subject lines;Personalize with customer name;Keep mobile-friendly;Include clear CTA"
```

## Method 2: JSON Import

### JSON Template Structure

```json
[
  {
    "title": "Prompt Title",
    "department": "Department Name",
    "subcategory": "Subcategory Name",
    "description": "Brief description of the prompt",
    "content": "Full prompt content with [PLACEHOLDERS]",
    "icon": "📧",
    "tags": ["tag1", "tag2", "tag3"],
    "complexity": 2,
    "tips": [
      "Tip 1",
      "Tip 2",
      "Tip 3"
    ]
  }
]
```

### JSON Field Specifications

| Field | Type | Required | Format | Example |
|-------|------|----------|--------|---------|
| **title** | String | ✅ Yes | Text | "Email Marketing Campaign" |
| **department** | String | ✅ Yes | Must match existing department | "Marketing" |
| **subcategory** | String | ✅ Yes | Text | "Email Marketing" |
| **description** | String | ✅ Yes | Brief summary | "Create compelling campaigns" |
| **content** | String | ✅ Yes | Full prompt with placeholders | "You are a marketing expert..." |
| **icon** | String | ❌ No | Single emoji | "📧" |
| **tags** | Array | ❌ No | Array of strings | ["email", "marketing"] |
| **complexity** | Number | ❌ No | 1, 2, or 3 | 2 |
| **tips** | Array | ❌ No | Array of strings | ["Tip 1", "Tip 2"] |

### JSON Import Steps

1. **Open Admin Panel**: Navigate to http://localhost:3000/admin-login
2. **Login**: Use password `sparkadmin2025`
3. **Scroll to Bulk Import Section**: Click "Bulk Import Prompts"
4. **Choose JSON File**:
   - Use the template file: `bulk_import_template.json`
   - Or create your own following the template structure
5. **Click "Import Prompts"**
6. **Review Results**: Check success/error messages

### JSON Tips

- JSON must be valid (use a validator like jsonlint.com)
- Arrays must use square brackets `[]`
- Strings must use double quotes `""`
- No trailing commas allowed
- Escape special characters: `\"` for quotes, `\\` for backslashes
- Use proper indentation for readability

### JSON Example Entry

```json
{
  "title": "Email Marketing Campaign",
  "department": "Marketing",
  "subcategory": "Email Marketing",
  "description": "Create compelling email campaigns for product launches",
  "content": "You are a marketing expert. Create an email campaign for [PRODUCT NAME] targeting [AUDIENCE]. Include: 1) Subject lines (5 variations) 2) Email body copy 3) Call-to-action 4) Follow-up sequence",
  "icon": "📧",
  "tags": ["email", "marketing", "campaign", "copywriting"],
  "complexity": 2,
  "tips": [
    "Use A/B testing for subject lines",
    "Personalize with customer name",
    "Keep mobile-friendly",
    "Include clear CTA"
  ]
}
```

## Validation Rules

### Required Fields
- **title**: Must be unique across all prompts
- **department**: Must match one of the 9 valid departments exactly
- **subcategory**: Cannot be empty
- **description**: Should be 1-2 sentences
- **content**: Should be detailed prompt instructions

### Optional Fields
- **icon**: Single emoji character (defaults to department icon if not provided)
- **tags**: Array of relevant keywords for search/filtering
- **complexity**: 1 (Easy), 2 (Medium), or 3 (Advanced) - defaults to 2
- **tips**: Best practices or usage suggestions

### Common Validation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Department not found" | Invalid department name | Use exact department name from valid list |
| "Duplicate title" | Title already exists | Change title to be unique |
| "Missing required field" | Missing title/department/content | Add all required fields |
| "Invalid JSON" | Malformed JSON syntax | Validate JSON structure |
| "Invalid complexity" | Complexity not 1, 2, or 3 | Use only 1, 2, or 3 |

## Best Practices

### Writing Effective Prompts

1. **Clear Role Definition**: Start with "You are a [ROLE]..."
2. **Use Placeholders**: `[PRODUCT]`, `[AUDIENCE]`, `[TOPIC]` for user inputs
3. **Structured Output**: Number steps or use bullet points
4. **Specific Instructions**: Be detailed about expected format
5. **Context Setting**: Provide relevant background information

### Organizing Content

1. **Department**: Choose the most relevant business function
2. **Subcategory**: Be specific (e.g., "Email Marketing" not just "Marketing")
3. **Tags**: Include 3-6 relevant keywords
4. **Complexity**:
   - 1 = Simple, single-step prompts
   - 2 = Multi-step or moderate complexity
   - 3 = Advanced, requires expertise
5. **Tips**: 3-5 actionable best practices

### Quality Checklist

- [ ] Title is unique and descriptive
- [ ] Department matches exactly (case-sensitive)
- [ ] Content includes clear instructions
- [ ] Placeholders use `[BRACKETS]`
- [ ] Description is concise (1-2 sentences)
- [ ] Tags are relevant and searchable
- [ ] Tips provide actionable value
- [ ] Complexity reflects actual difficulty

## Troubleshooting

### CSV Issues

**Problem**: Import fails with "Invalid format"
- **Solution**: Ensure all text fields are quoted
- **Solution**: Check for unescaped quotes inside content

**Problem**: Tags not importing correctly
- **Solution**: Remove spaces after commas: `tag1,tag2` not `tag1, tag2`

**Problem**: Tips appear as single string
- **Solution**: Use semicolons (`;`) as separators, not commas

### JSON Issues

**Problem**: "Unexpected token" error
- **Solution**: Validate JSON at jsonlint.com
- **Solution**: Remove trailing commas
- **Solution**: Use double quotes for all strings

**Problem**: Array not recognized
- **Solution**: Ensure arrays use `[]` brackets
- **Solution**: Separate array items with commas

**Problem**: Special characters cause errors
- **Solution**: Escape quotes: `\"`
- **Solution**: Escape backslashes: `\\`

## Testing Your Import

### Small Test First
1. Start with 2-3 prompts in your file
2. Import and verify they appear correctly
3. Check all fields are populated
4. Test search and filtering
5. Scale up to full import

### Verify After Import
1. Check prompt count in dashboard
2. Browse by department
3. Search for specific prompts
4. View individual prompts for formatting
5. Test complexity and tag filters

## Example Use Cases

### Use Case 1: Marketing Team Onboarding
- Import 50 marketing prompts
- Include email, social media, content categories
- Use complexity 1-2 for easy adoption
- Add tips for company-specific best practices

### Use Case 2: Sales Enablement
- Import cold email, pitch, objection handling prompts
- Tag by sales stage (prospecting, discovery, closing)
- Include industry-specific variations
- Complexity 2-3 for experienced reps

### Use Case 3: Content Creation Library
- Import writing prompts for blogs, social, video
- Organize by content type and platform
- Tag by industry and use case
- Include SEO optimization tips

## Support

For issues or questions:
- Check browser console for detailed errors
- Review server logs at `server/api.js`
- Verify admin authentication is active
- Test with template files first

## Files Generated

After successful import, check:
- `public/prompts_index.json` - Updated with new prompts
- `backups/` - Auto-backup created before import
- Server logs - Import summary and errors

---

**Admin Panel**: http://localhost:3000/admin-login
**Password**: `sparkadmin2025`
**Current Prompt Count**: 2,423 prompts

**Template Files**:
- `bulk_import_template.csv`
- `bulk_import_template.json`
