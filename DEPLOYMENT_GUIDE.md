# SPARK Prompt Library - Deployment Guide

Complete guide to deploy SPARK so users anywhere can access it.

---

## 🌐 Deployment Options

| Option | Difficulty | Cost | Best For |
|--------|-----------|------|----------|
| **Railway** | ⭐ Easy | Free tier available | Quick deployment, auto-SSL |
| **Vercel** | ⭐⭐ Medium | Free tier available | Static sites, serverless |
| **Digital Ocean** | ⭐⭐⭐ Advanced | $4/month | Full control, custom domain |
| **AWS/Azure** | ⭐⭐⭐⭐ Expert | $10+/month | Enterprise, scaling |

---

## 🚂 Option 1: Railway (Recommended - Easiest)

Railway provides automatic deployments, SSL certificates, and requires zero configuration.

### Step 1: Prepare Your Repository

```bash
# Make sure you're in the project directory
cd SPARK_LIBRARY_FLUENT_UI_VERSION

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for deployment"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/spark-library.git
git push -u origin main
```

### Step 2: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway to access your repositories

### Step 3: Deploy

**Via Railway Dashboard:**

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `spark-library` repository
4. Railway auto-detects configuration and deploys!

**Via Railway CLI (Alternative):**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Step 4: Configure Environment Variables

1. In Railway dashboard, click your project
2. Go to **Variables** tab
3. Add:
   ```
   ADMIN_PASSWORD=YourSecurePassword123
   NODE_ENV=production
   PORT=3001
   ```
4. Save and redeploy

### Step 5: Get Your URL

Railway provides a free URL:
```
https://your-app-name.up.railway.app
```

**Custom Domain (Optional):**
1. Go to **Settings** → **Domains**
2. Click **"Generate Domain"** or add custom domain
3. Follow DNS configuration instructions

### ✅ You're Live!

Share your URL:
```
https://spark-library.up.railway.app
```

Users can now:
- Browse prompts at `/browse`
- Add prompts (public)
- Admins can login at `/admin-login`

---

## ⚡ Option 2: Vercel

Vercel is great for frontend deployment with serverless functions.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Configure Project

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/api.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/api.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Step 4: Build Configuration

Update `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "npm run build"
  }
}
```

### Step 5: Deploy

```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

### Step 6: Set Environment Variables

```bash
# Via CLI
vercel env add ADMIN_PASSWORD production

# Or via dashboard
# 1. Go to vercel.com/dashboard
# 2. Select your project
# 3. Settings → Environment Variables
# 4. Add ADMIN_PASSWORD
```

### ✅ Live URL

```
https://spark-library.vercel.app
```

---

## 🌊 Option 3: Digital Ocean Droplet

Full control with your own server.

### Step 1: Create Droplet

1. Sign up at https://www.digitalocean.com
2. Create new Droplet:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic $4/month (1GB RAM)
   - **Region:** Choose closest to your users
   - **SSH Key:** Add your SSH key

### Step 2: Connect to Server

```bash
ssh root@your_droplet_ip
```

### Step 3: Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Install Git
apt install git -y
```

### Step 4: Clone and Deploy

```bash
# Clone repository
git clone https://github.com/yourusername/spark-library.git
cd spark-library

# Create .env file
nano .env
```

Add to `.env`:
```env
ADMIN_PASSWORD=YourSecurePassword
NODE_ENV=production
PORT=3001
```

```bash
# Start with Docker Compose
docker-compose up -d

# Check status
docker-compose logs -f
```

### Step 5: Configure Firewall

```bash
# Allow HTTP, HTTPS, SSH
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### Step 6: Setup Nginx Reverse Proxy

```bash
# Install Nginx
apt install nginx -y

# Create configuration
nano /etc/nginx/sites-available/spark
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/spark /etc/nginx/sites-enabled/
systemctl restart nginx
```

### Step 7: Setup SSL with Let's Encrypt

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d your_domain.com

# Auto-renewal is configured automatically
```

### ✅ Live URL

```
https://your_domain.com
```

---

## ☁️ Option 4: AWS EC2

Enterprise-grade deployment on Amazon Web Services.

### Step 1: Launch EC2 Instance

1. Sign in to AWS Console
2. Navigate to EC2
3. Click **Launch Instance**
4. Choose **Ubuntu 22.04 LTS**
5. Instance type: **t2.micro** (free tier) or **t2.small**
6. Configure Security Group:
   - SSH (22) - Your IP
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere
7. Create and download key pair
8. Launch instance

### Step 2: Connect

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@ec2-xx-xxx-xxx-xx.compute.amazonaws.com
```

### Step 3: Install Docker

```bash
sudo apt update
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker ubuntu
```

Logout and login again for group changes.

### Step 4: Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/spark-library.git
cd spark-library

# Create .env
nano .env
# Add your ADMIN_PASSWORD

# Start containers
docker-compose up -d
```

### Step 5: Configure Domain (Optional)

1. **Route 53**: Create hosted zone for your domain
2. **Point domain**: Add A record to EC2 public IP
3. **SSL**: Use Certbot or AWS Certificate Manager

### ✅ Access

```
http://ec2-xx-xxx-xxx-xx.compute.amazonaws.com
```

Or with domain:
```
https://spark.yourdomain.com
```

---

## 🔒 Security Checklist

Before making your deployment public:

### Essential Security

- [ ] **Change default password** in `.env`
- [ ] **Enable HTTPS/SSL** (free with Let's Encrypt)
- [ ] **Configure firewall** (UFW or cloud firewall)
- [ ] **Regular updates** `apt update && apt upgrade`
- [ ] **Strong admin password** (12+ characters, mixed case, numbers, symbols)

### Recommended Security

- [ ] **Backup automation** - Schedule regular backups
- [ ] **Rate limiting** - Prevent abuse (add to Nginx)
- [ ] **Monitoring** - Setup uptime monitoring
- [ ] **DDoS protection** - Use Cloudflare (free tier)
- [ ] **Database backups** - Store off-server

### Advanced Security

- [ ] **Container scanning** - Scan Docker images
- [ ] **Secrets management** - Use AWS Secrets Manager / Vault
- [ ] **Access logs** - Monitor for suspicious activity
- [ ] **2FA for admin** - Add two-factor authentication
- [ ] **API key authentication** - For bulk operations

---

## 📊 Performance Optimization

### For Railway/Vercel

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### For VPS/EC2

Add to Nginx configuration:

```nginx
# Enable gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript;

# Browser caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Database Optimization

```bash
# If prompts_index.json grows large:

# 1. Split by department
# 2. Implement pagination
# 3. Use CDN for static files
# 4. Consider migrating to PostgreSQL
```

---

## 🌍 Custom Domain Setup

### For Railway

1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Railway dashboard: **Settings** → **Domains**
3. Add custom domain
4. Update DNS records at your registrar:
   ```
   Type: CNAME
   Name: @
   Value: your-app.up.railway.app
   ```
5. Wait for DNS propagation (5-60 minutes)

### For Vercel

```bash
vercel domains add yourdomain.com
```

Follow instructions to configure DNS.

### For VPS

Already configured in Nginx step above. Just update domain in:
```nginx
server_name yourdomain.com;
```

---

## 📦 Sharing with Users

Once deployed, share these links with your users:

### For End Users

**Homepage:**
```
https://your-domain.com
```

**Browse Prompts:**
```
https://your-domain.com/browse
```

**M365 Integration Setup:**
Share the `USER_GUIDE.md` - section "M365 Copilot Integration"

### For Admins

**Admin Login:**
```
https://your-domain.com/admin-login
```

**Password:** Share securely (1Password, LastPass, etc.)

### Documentation Links

Create a simple landing page with:
- Link to browse prompts
- Link to user guide
- Link to install Tampermonkey script
- Admin login (for authorized users only)

---

## 🔄 Updating Deployed Application

### Railway

```bash
# Simply push to GitHub
git add .
git commit -m "Update prompts"
git push origin main

# Railway auto-deploys!
```

### Vercel

```bash
vercel --prod
```

### VPS/EC2

```bash
# SSH to server
ssh user@your-server

# Navigate to project
cd spark-library

# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📈 Monitoring & Analytics

### Uptime Monitoring (Free)

**UptimeRobot:**
1. Sign up at https://uptimerobot.com
2. Add monitor for your URL
3. Get alerts via email/SMS if site goes down

**Pingdom:**
- Free tier available
- More detailed analytics

### Usage Analytics

Add to `index.html`:

```html
<!-- Google Analytics (Optional) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Server Monitoring (VPS/EC2)

```bash
# Install monitoring tools
apt install htop
apt install netdata -y

# Access Netdata dashboard
http://your-server-ip:19999
```

---

## 💰 Cost Breakdown

### Free Tier Options

| Service | Free Tier | Limitations |
|---------|-----------|-------------|
| **Railway** | $5 credit/month | 500 hours execution |
| **Vercel** | Unlimited | 100GB bandwidth |
| **Netlify** | Unlimited | 100GB bandwidth |
| **AWS** | 12 months free | t2.micro only |

### Paid Options

| Service | Cost/Month | Specs |
|---------|-----------|-------|
| **Digital Ocean** | $4 | 1GB RAM, 25GB SSD |
| **Linode** | $5 | 1GB RAM, 25GB SSD |
| **AWS t2.small** | ~$17 | 2GB RAM, EBS storage |
| **Azure B1S** | ~$10 | 1GB RAM, 10GB storage |

**Domain Costs:**
- .com domain: ~$12/year
- .ai domain: ~$70/year
- .app domain: ~$15/year

---

## 🎯 Recommended Setup by Use Case

### Personal Use
- **Platform**: Railway free tier
- **Domain**: subdomain.railway.app (free)
- **Cost**: $0/month

### Small Team (5-20 users)
- **Platform**: Digital Ocean $4/month droplet
- **Domain**: yourdomain.com ($12/year)
- **SSL**: Let's Encrypt (free)
- **Total**: ~$5/month

### Company/Organization (50+ users)
- **Platform**: Digital Ocean $12/month (2GB RAM)
- **Domain**: company.com
- **Backup**: Weekly automated backups
- **Monitoring**: UptimeRobot
- **CDN**: Cloudflare (free)
- **Total**: ~$15/month

### Enterprise (500+ users)
- **Platform**: AWS/Azure with load balancing
- **Database**: Move to PostgreSQL
- **Caching**: Redis
- **CDN**: CloudFront/Azure CDN
- **Monitoring**: DataDog/New Relic
- **Total**: $50-200/month

---

## ✅ Pre-Launch Checklist

Before sharing your deployment:

- [ ] Test all pages load correctly
- [ ] Test floating button appears and works
- [ ] Test search functionality
- [ ] Test adding a prompt (public)
- [ ] Test admin login
- [ ] Test editing a prompt (admin)
- [ ] Test M365 Copilot integration
- [ ] Verify SSL certificate is working
- [ ] Set strong admin password
- [ ] Create backup of prompts_index.json
- [ ] Test on mobile device
- [ ] Check page load speed
- [ ] Setup uptime monitoring
- [ ] Document admin credentials securely
- [ ] Create user guide for team

---

## 🚀 You're Ready to Launch!

Your SPARK library is now accessible from anywhere. Users can:

✅ Browse 2,425+ prompts from any device
✅ Search and filter by department
✅ Customize prompts with variables
✅ Send directly to M365 Copilot
✅ Add their own prompts
✅ Access via custom domain

**Share your deployment:**
```
📚 SPARK Prompt Library
🌐 https://your-domain.com
📖 User Guide: /USER_GUIDE.md
⚡ M365 Integration: Install Tampermonkey script
```

---

**Questions? Issues?**

- 📖 See `CLAUDE.md` for developer documentation
- 🐛 Check `README.md` for troubleshooting
- 💬 Create an issue on GitHub

**Made with ⚡ by the SPARK Team**
