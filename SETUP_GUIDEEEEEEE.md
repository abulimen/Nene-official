# Nene Yogurt - Complete Setup Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Vercel Deployment Setup](#vercel-deployment-setup)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18.0.0 to v22.x) - [Download](https://nodejs.org/)
  - Verify installation: `node --version && npm --version`
- **Git** - [Download](https://git-scm.com/)
- **PostgreSQL** (optional - if using local database) - [Download](https://www.postgresql.org/download/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/abulimen/nene-official.git
cd nene-official
```

### Step 2: Install Dependencies

Install dependencies for both frontend and backend:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 3: Set Up Environment Variables

Create `.env` files for both frontend and backend:

**Root directory (.env):**
```bash
# Copy the example file
cp .env.example .env

# Edit and fill in your credentials
# See the Environment Variables section below
```

**Backend directory (backend/.env):**
```bash
# Copy the example file
cp ../.env.example backend/.env

# Edit and fill in your credentials
```

### Step 4: Database Setup (Supabase)

1. **Create a Supabase Account:**
   - Go to [app.supabase.com](https://app.supabase.com/)
   - Sign up with your email or GitHub account

2. **Create a New Project:**
   - Click "New Project"
   - Select organization
   - Enter project name (e.g., "nene-local")
   - Set a strong database password
   - Choose region closest to you
   - Click "Create new project"

3. **Get Your Credentials:**
   - Go to **Settings → API** in your project
   - Copy and save:
     - **Project URL** → `SUPABASE_URL`
     - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`
     - **Anon Key** → `SUPABASE_ANON_KEY`

4. **Initialize Database Schema:**
   - In Supabase console, go to **SQL Editor**
   - Create a new query
   - Copy the SQL from [supabase_schema.sql](supabase_schema.sql)
   - Paste into the query editor
   - Click "Run"

5. **Run Migrations:**
   ```bash
   cd backend
   npm run migrations  # If available in scripts
   # Or manually execute migration files from migrations/ directory
   cd ..
   ```

### Step 5: Set Up External Services

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google+ API**
4. Go to **Credentials → Create OAuth 2.0 Client ID**
   - Select Web application
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173/callback`
5. Copy **Client ID** → `VITE_GOOGLE_CLIENT_ID`

#### Brevo (Email Service)
1. Sign up at [app.brevo.com](https://app.brevo.com/)
2. Go to **Settings → API Keys**
3. Create and copy your API key → `BREVO_API_KEY`
4. Go to **Senders & Contacts → Senders**
5. Add and verify your sender email → `BREVO_SENDER_EMAIL`

#### Paystack (Payment Gateway)
1. Sign up at [paystack.com](https://paystack.com/)
2. Go to **Settings → API Keys & Webhooks**
3. Copy:
   - **Public Key** → `PAYSTACK_PUBLIC_KEY`
   - **Secret Key** → `PAYSTACK_SECRET_KEY`
4. Save webhook URL (you'll set this in Vercel later)

### Step 6: Start Development Servers

**Option A: Run separately**
```bash
# Terminal 1 - Frontend (from root)
npm run dev
# Opens at http://localhost:5173

# Terminal 2 - Backend (from backend directory)
npm run dev
# Runs at http://localhost:5000
```

**Option B: Run concurrently**
```bash
# From root directory (requires concurrently package)
npm run dev:all
```

### Step 7: Verify Setup

- Frontend: [http://localhost:5173](http://localhost:5173)
- API Health: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- Admin Dashboard: [http://localhost:5173/admin](http://localhost:5173/admin)

---

## Vercel Deployment Setup

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com/)
2. Sign in with your GitHub account
3. Click **New Project**
4. Import your repository
5. **Configure Project:**
   - Framework Preset: **Vite**
   - Root Directory: **./** (root)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. **Add Environment Variables:**
   ```
   FRONTEND_URL=https://yourdomain.vercel.app
   VITE_API_URL=https://your-api-domain.com/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ADMIN_URL=https://yourdomain.vercel.app/admin
   ```

7. Click **Deploy**
8. Your frontend will be live at `https://yourdomain.vercel.app`

### Step 3: Deploy Backend to Vercel (or Alternative)

**Option A: Deploy to Vercel Serverless Functions**

1. Create `vercel.json` in backend root:
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "server.js", "use": "@vercel/node" }
     ],
     "routes": [
       { "src": "/(.*)", "dest": "server.js" }
     ]
   }
   ```

2. In Vercel, create a new project for backend
3. Select backend directory
4. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=generate_secure_key
   JWT_EXPIRES_IN=7d
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   BREVO_API_KEY=your_brevo_key
   BREVO_SENDER_EMAIL=your_email@yourdomain.com
   BREVO_SENDER_NAME=Nene Yogurt
   PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   PAYSTACK_SECRET_KEY=your_paystack_secret_key
   UPLOAD_DIR=/tmp/uploads
   MAX_FILE_SIZE=52428800
   ```

**Option B: Deploy to Render/Railway/Heroku**

If you prefer external hosting:

**Render:**
- Go to [render.com](https://render.com/)
- Connect GitHub repo
- Select backend folder
- Use Node environment
- Add environment variables

**Railway:**
- Go to [railway.app](https://railway.app/)
- Connect GitHub
- Create new project from repo
- Configure environment variables

### Step 4: Update Frontend API URLs

After backend deployment, update Vercel frontend environment variable:
```
VITE_API_URL=https://your-api-domain.com/api
```

Then redeploy frontend.

### Step 5: Configure Payment Webhooks

**Paystack Webhook Setup:**
1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Settings → Webhooks
3. Add webhook URL: `https://your-api-domain.com/api/webhooks/paystack`
4. Select events: `charge.success`, `charge.failed`

### Step 6: Configure Database Backups

In Supabase project:
1. Settings → Backups
2. Enable daily backups
3. Set backup frequency

### Step 7: Enable Custom Domain (Optional)

**For Frontend:**
1. Vercel project settings
2. Domains
3. Add custom domain
4. Follow DNS instructions for your registrar

**For Backend:**
1. Add custom domain with DNS provider
2. Update `VITE_API_URL` in frontend
3. Redeploy frontend

---

## Environment Variables

### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `FRONTEND_URL` | Frontend application URL | `https://yourdomain.com` |
| `VITE_API_URL` | Backend API endpoint | `https://api.yourdomain.com/api` |
| `ADMIN_URL` | Admin dashboard URL | `https://yourdomain.com/admin` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxxx.apps.googleusercontent.com` |

### Backend Variables

| Variable | Description | How to Get |
|----------|-------------|-----------|
| `NODE_ENV` | Environment | `development`, `production` |
| `PORT` | Server port | Local: `5000`, Production: `3001` |
| `JWT_SECRET` | JWT signing key | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token expiration | `7d`, `24h` |
| `SUPABASE_URL` | Supabase Project URL | Supabase console → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Supabase console → Settings → API |
| `SUPABASE_ANON_KEY` | Anon key | Supabase console → Settings → API |
| `BREVO_API_KEY` | Email service API key | [app.brevo.com](https://app.brevo.com/) → Settings → API Keys |
| `BREVO_SENDER_EMAIL` | Sender email address | Verified in Brevo |
| `BREVO_SENDER_NAME` | Sender display name | `Nene Yogurt` |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key | Paystack dashboard → Settings → API Keys |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | Paystack dashboard → Settings → API Keys |
| `UPLOAD_DIR` | Upload directory | Local: `./uploads`, Production: `/tmp/uploads` |
| `MAX_FILE_SIZE` | Max file size in bytes | `52428800` (50MB) |
| `CLOUDINARY_URL` | Cloudinary connection | Optional cloud storage |

---

## Database Setup

### Initial Schema

The database includes tables for:
- **Products** - Product catalog with variations and pricing
- **Orders** - Customer orders with status tracking
- **Customers** - User accounts and profiles
- **Cart** - Shopping cart items
- **Blog** - Blog posts and comments
- **Reviews** - Product reviews and ratings
- **FAQ** - Frequently asked questions
- **Admin Users** - Admin accounts and permissions

### Running Migrations

```bash
cd backend

# Run migrations (if migration scripts exist)
npm run migrate  # or specific migration command

# Seed initial data
npm run seed

# Verify database
npm run db:status
```

### Resetting Database

```bash
# WARNING: This will delete all data!
# In Supabase console:
# 1. Go to SQL Editor
# 2. Create new query
# 3. Run: DROP SCHEMA public CASCADE; CREATE SCHEMA public;
# 4. Re-run migrations
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process using port 5000
lsof -i :5000
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### CORS Errors
Update `backend/server.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Database Connection Errors
1. Verify `SUPABASE_URL` is correct
2. Check `SUPABASE_SERVICE_ROLE_KEY` is valid
3. Ensure Supabase project is active
4. Check firewall isn't blocking connection

### JWT Token Errors
```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env files with new secret
```

### Email Not Sending
1. Verify `BREVO_API_KEY` is correct
2. Check sender email is verified in Brevo
3. Check spam folder
4. Review Brevo logs for errors

### Payment Webhook Issues
1. Verify webhook URL is publicly accessible
2. Check Paystack secret key is correct
3. Verify webhook events are selected
4. Review Paystack webhook logs

### Vercel Build Failures
```bash
# Check build locally first
npm run build

# Review Vercel logs for errors
# Common issues:
# - Missing environment variables
# - Node version mismatch
# - Missing dependencies
```

---

## Production Checklist

Before going live, ensure:

- [ ] All environment variables configured
- [ ] Supabase backups enabled
- [ ] Custom domain configured
- [ ] SSL certificate installed
- [ ] Payment gateway in production mode
- [ ] Email templates configured
- [ ] Error logging set up (Sentry, LogRocket)
- [ ] Database indexed for performance
- [ ] Rate limiting configured
- [ ] Security headers added
- [ ] CORS properly configured
- [ ] Monitoring/alerts enabled
- [ ] Backup disaster recovery plan

---

## Getting Help

For issues or questions:
1. Check this guide's Troubleshooting section
2. Review service documentation:
   - [Supabase Docs](https://supabase.com/docs)
   - [Vercel Docs](https://vercel.com/docs)
   - [Paystack Docs](https://paystack.com/developers)
   - [Brevo Docs](https://developers.brevo.com/)
3. Check GitHub issues
4. Contact support for your hosting service

---

## Quick Reference Commands

```bash
# Local Development
npm install                    # Install all dependencies
npm run dev:all               # Start frontend and backend
npm run dev                   # Frontend only
cd backend && npm run dev     # Backend only

# Building
npm run build                 # Build frontend
cd backend && npm run build   # Build backend

# Database
npm run migrations            # Run migrations
npm run seed                  # Seed data

# Linting
npm run lint                  # Check code style

# Testing
npm run test                  # Run tests
cd backend && npm test        # Backend tests
```

---

**Last Updated:** March 12, 2026  
**Version:** 1.0.0
