# Data Directory

This directory is for storing the AI Prompts data folders.

## For New Users

If you have the prompt data folders (AI Prompts for Business, AI Prompts for Marketing, etc.), copy them here:

```bash
cp -r /path/to/AI\ Prompts\ for* data/
```

## For Docker Users

This directory will be used by Docker to mount the prompt data. If you don't have prompt data yet, the application will still run but won't show any prompts until data is added.

## Directory Structure Expected

```
data/
├── AI Prompts for Business/
├── AI Prompts for Marketing/
├── AI Prompts for Sales/
├── AI Prompts for SEO/
├── AI Prompts for Finance/
├── AI Prompts for Education/
├── AI Prompts for Writing/
├── AI Prompts for Productivity/
└── AI Prompts for Solopreneurs/
```