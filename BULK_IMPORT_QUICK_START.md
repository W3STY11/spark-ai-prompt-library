# Bulk Import Quick Start

## 🚀 Access the Admin Panel

**URL**: http://localhost:3000/admin-login
**Password**: `sparkadmin2025`

## 📁 Template Files

Located in: `/home/aiwithnick/SPARK_LIBRARY_FLUENT_UI_VERSION/`

- `bulk_import_template.csv` - CSV format (Excel-compatible)
- `bulk_import_template.json` - JSON format
- `BULK_IMPORT_GUIDE.md` - Complete documentation

## ⚡ Quick CSV Import (3 Steps)

1. **Edit the template**: Open `bulk_import_template.csv` in Excel/Google Sheets
2. **Fill in your prompts**: Follow the example rows provided
3. **Import**: Admin Panel → Bulk Import → Choose File → Import

## 📋 CSV Format Cheat Sheet

```csv
title,department,subcategory,description,content,icon,tags,complexity,tips
"Title","Department","Subcategory","Description","Content","📧","tag1,tag2",2,"Tip1;Tip2"
```

**Required**: title, department, subcategory, description, content
**Optional**: icon, tags, complexity, tips

## 🎯 Valid Departments (MUST MATCH EXACTLY)

- Business
- Marketing
- Sales
- SEO
- Finance
- Education
- Writing
- Productivity
- Solopreneurs

## 💡 Pro Tips

- **CSV**: Use semicolons (`;`) for multiple tips, commas for tags
- **JSON**: Must be valid JSON (use jsonlint.com to validate)
- **Test first**: Import 2-3 prompts before bulk upload
- **Backup**: System auto-backups before import

## ❓ Need Help?

See `BULK_IMPORT_GUIDE.md` for:
- Detailed field specifications
- Validation rules
- Troubleshooting
- Example use cases
