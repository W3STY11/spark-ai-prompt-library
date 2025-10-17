# 🚀 SPARK AI Prompt Library

> A comprehensive, self-hosted prompt library with **2,376+ professional AI prompts** across 9 business departments

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](https://www.docker.com/)
[![Prompts](https://img.shields.io/badge/prompts-2376%2B-orange.svg)](#)

---

## ✨ Features

### 📚 Browse Library (Public Access)
- 🔍 **Full-text search** across all 2,376+ prompts
- 📂 **Department filtering** (Business, Marketing, Sales, SEO, Finance, Education, Writing, Productivity, Solopreneurs)
- 📊 **Smart sorting** by title, date, or word count
- 📋 **One-click copy** to clipboard
- ➕ **Submit new prompts** without authentication
- 🎨 **Responsive design** works on any device
- 🤖 **Copilot button** for quick AI access

### 🛠️ Admin Dashboard (Secure)
- 🔐 **Password-protected** admin access
- ✏️ **Edit prompts** with full metadata control
- 🗑️ **Safe deletion** with automatic backups
- 📈 **Statistics** - track your prompt library
- 💾 **Manual backups** on demand
- 📊 **Data quality** validation tools
- 📤 **JSON export** for portability
- 🔄 **Auto-backup** before every change

### ⚡ Technical Highlights
- 🐳 **Docker Compose** - one command deployment
- 🔒 **100% offline** - no external dependencies
- 💾 **File-based** - simple JSON database
- 🌐 **Cross-platform** - Windows, Mac, Linux
- 🔄 **Version controlled** backups
- ⚡ **Lightning fast** performance

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/W3STY11/spark-prompt-library.git
cd spark-prompt-library

# 2. (Optional but RECOMMENDED) Set custom admin password
cp .env.example .env
nano .env  # Edit ADMIN_PASSWORD (default: YourSecurePasswordHere)

# 3. Start the application
docker-compose up -d

# First startup takes 2-3 minutes to build containers
# Watch the logs: docker-compose logs -f
```

**Note:** If you skip step 2, the default password from `.env.example` will be used.

### Access Points

| Interface | URL | Credentials |
|-----------|-----|-------------|
| **Browse Library** | http://localhost:3000/browse.html | No auth required |
| **Admin Dashboard** | http://localhost:3000/admin-login.html | Set in `.env` file |

---

## 📦 What's Included

### Prompt Categories

| Department | Count | Description |
|------------|-------|-------------|
| 💼 Business | 332 | Strategy, operations, analytics, HR |
| 📢 Marketing | 234 | Campaigns, branding, content, social |
| 💰 Sales | 252 | Outreach, proposals, CRM, closing |
| 💵 Finance | 181 | Budgeting, forecasting, reporting |
| 🔍 SEO | 241 | Keywords, optimization, analytics |
| 📚 Education | 292 | Lesson plans, curriculum, assessment |
| ✍️ Writing | 391 | Content, copywriting, storytelling |
| ⚡ Productivity | 237 | Automation, time management, workflows |
| 🚀 Solopreneurs | 216 | Business building, growth, freelancing |

### Data Structure
Each prompt includes:
- Full title and description
- Complete prompt content
- Department and subcategory
- Searchable tags
- Word count and complexity
- Creation date
- Usage tips
- Example outputs (images)

---

## 🛠️ Architecture

```
┌─────────────────────────────────────────────────┐
│              Docker Compose                     │
├─────────────────┬───────────────────────────────┤
│   Frontend      │         API Server            │
│   (Vite)        │         (Express.js)          │
│   Port 3000     │         Port 3001             │
├─────────────────┴───────────────────────────────┤
│           Shared Volumes                        │
│   • public/prompts_index.json (database)        │
│   • backups/ (auto-generated)                   │
└─────────────────────────────────────────────────┘
```

### Tech Stack
- **Frontend:** Vite, Tailwind CSS, Vanilla JavaScript
- **Backend:** Express.js, Node.js
- **Database:** JSON file (prompts_index.json)
- **Deployment:** Docker Compose
- **Authentication:** Session-based tokens

---

## 📖 Usage

### For End Users

1. **Browse Prompts**
   - Open browse library
   - Search or filter by department
   - Click "Copy" to use prompt

2. **Submit New Prompts**
   - Click "Add New Prompt" button
   - Fill out form (no login required)
   - Prompt added to library

### For Admins

1. **Login to Admin Dashboard**
   - Navigate to admin login page
   - Enter password from `.env`
   - Access full admin features

2. **Edit Prompts**
   - Browse prompts in admin view
   - Click "Edit" on any prompt
   - Make changes and save

3. **Manage Backups**
   - Automatic backups before edits/deletes
   - Manual backup via dashboard button
   - Restore from `backups/` folder

4. **Data Quality**
   - Run validation checks
   - Find duplicates, missing fields
   - Clean up database

---

## 🔧 Configuration

### Environment Variables

Edit `.env` file:

```env
# Admin password (CHANGE THIS!)
ADMIN_PASSWORD=YourSecurePasswordHere

# Server configuration
NODE_ENV=production
PORT=3001

# Backup settings
BACKUP_RETENTION_DAYS=30
MAX_BACKUPS=100
```

### Changing Password After Setup

If you need to change the admin password after containers are already running:

```bash
# 1. Edit the .env file
nano .env  # Change ADMIN_PASSWORD

# 2. Restart containers to apply changes
docker-compose down && docker-compose up -d

# Note: 'docker-compose restart' won't work for .env changes
# You must use 'down' then 'up' to apply new environment variables
```

### Port Configuration

Edit `docker-compose.yml` to change ports:

```yaml
services:
  frontend:
    ports:
      - "8080:3000"  # Change first number to your desired port
```

---

## 🐳 Docker Commands

```bash
# Start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d

# Check container status
docker ps
```

---

## 💾 Data Management

### Database Location
```
public/prompts_index.json
```

### Backup Location
```
backups/prompts_backup_YYYYMMDD_HHMMSS_reason.json
```

### Restoring from Backup
```bash
# Stop containers
docker-compose down

# Copy backup to main database
cp backups/prompts_backup_20251015_143000_manual.json public/prompts_index.json

# Restart
docker-compose up -d
```

### Bulk Import via API
```javascript
const response = await fetch('http://localhost:3001/api/prompts/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompts: [
      {
        title: 'Your Prompt Title',
        description: 'Brief description',
        content: 'Full prompt content here',
        department: 'Business',
        subcategory: 'Strategy',
        tags: ['planning', 'strategy'],
        complexity: 'intermediate'
      }
    ]
  })
});
```

---

## 🔌 API Documentation

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/prompts` | Create new prompt |
| POST | `/api/prompts/bulk` | Bulk import prompts |
| GET | `/api/health` | Health check |

### Admin Endpoints (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| POST | `/api/admin/logout` | Admin logout |
| PUT | `/api/prompts/:id` | Update prompt |
| DELETE | `/api/prompts/:id` | Delete prompt |
| POST | `/api/prompts/bulk-delete` | Bulk delete |
| GET | `/api/admin/backups` | List backups |
| POST | `/api/admin/backup` | Manual backup |
| GET | `/api/admin/validate` | Data quality check |

---

## 🐛 Troubleshooting

### Containers won't start
```bash
# Check Docker is running
docker info

# View container logs
docker-compose logs

# Rebuild from scratch
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### Can't access application
- Ensure containers are running: `docker ps`
- Check ports 3000/3001 aren't in use
- Try http://localhost:3000/browse.html directly

### Admin login fails
- Check password in `.env` file
- Copy `.env.example` to `.env` and set your password
- Clear browser cache

### Prompts not showing
- Verify `public/prompts_index.json` exists
- Check file is not empty (should be ~9MB)
- Restart containers

---

## 🔒 Security Best Practices

1. **Change default password** immediately
2. **Restrict network access** if deploying remotely
3. **Regular backups** of prompts_index.json
4. **Review logs** periodically
5. **Keep Docker updated**

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

- Built with Express.js, Vite, and Tailwind CSS
- Prompt collection curated for professional use
- Docker containerization for portability

---

## 🎯 Roadmap

- [ ] Advanced search with RegEx
- [ ] Multi-user support
- [ ] Prompt templates with variables
- [ ] API key authentication
- [ ] Prompt versioning/history
- [ ] Analytics dashboard
- [ ] CSV/Excel export
- [ ] Custom themes
- [ ] Prompt testing interface
- [ ] AI integration (OpenAI, Claude, etc.)

---

## 📧 Support

- **Issues:** [GitHub Issues](https://github.com/W3STY11/spark-prompt-library/issues)
- **Discussions:** [GitHub Discussions](https://github.com/W3STY11/spark-prompt-library/discussions)

---

**Made with ❤️ for the AI community**

⭐ If you find this useful, please star the repo!
