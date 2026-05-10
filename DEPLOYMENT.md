# 🚀 NexusHQ — Complete Deployment Guide

This guide takes you from zero to a **live, public URL** on Railway in about 15 minutes.

---

## ✅ Requirements Checklist

Before starting, confirm these are met:

- [ ] Authentication (Signup/Login) ✓
- [ ] Project & team management ✓
- [ ] Task creation, assignment & status tracking ✓
- [ ] Dashboard (tasks, status, overdue) ✓
- [ ] REST APIs ✓
- [ ] PostgreSQL database ✓
- [ ] Zod validations + Prisma relationships ✓
- [ ] Role-based access control (Admin / Project Manager / Member) ✓
- [ ] Deployable on Railway ✓

---

## STEP 1 — Push to GitHub

```bash
# 1. Create a new GitHub repo (do NOT add README, .gitignore, or license)
# Go to https://github.com/new → name it "nexus-taskmanager" → Create

# 2. In your project folder:
cd nexus-taskmanager

git init
git add .
git commit -m "Initial commit: NexusHQ Team Task Manager"

# 3. Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/nexus-taskmanager.git
git branch -M main
git push -u origin main
```

> ✅ Your code is now on GitHub.

---

## STEP 2 — Create Railway Account

1. Go to [https://railway.app](https://railway.app)
2. Click **Login** → **Login with GitHub**
3. Authorize Railway to access your GitHub account
4. You'll land on the Railway dashboard

---

## STEP 3 — Create New Project on Railway

1. Click **New Project**
2. Click **Deploy from GitHub repo**
3. Find and select `nexus-taskmanager`
4. Railway will start detecting the project — **do not deploy yet**

---

## STEP 4 — Add PostgreSQL Database

Inside your new Railway project:

1. Click **+ New** (top right)
2. Select **Database** → **Add PostgreSQL**
3. Wait ~30 seconds for Railway to provision the DB
4. Click on the PostgreSQL service → go to **Variables** tab
5. Copy the value of `DATABASE_URL` (you'll need it below)

---

## STEP 5 — Set Environment Variables

Click on your **app service** (not the PostgreSQL one) → go to **Variables** tab → click **Raw Editor** and paste:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=nexushq_jwt_secret_change_this_in_production_min32chars
JWT_REFRESH_SECRET=nexushq_refresh_secret_change_this_in_production_min32chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
ALLOWED_ORIGINS=${{RAILWAY_PUBLIC_DOMAIN}}
```

> **Note:** `${{Postgres.DATABASE_URL}}` is Railway's template syntax — it auto-links to your PostgreSQL service. No manual copying needed.

> **Security:** For production, generate real secrets with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
> ```

---

## STEP 6 — Set Build & Start Commands

In your app service → **Settings** tab:

| Field | Value |
|---|---|
| **Build Command** | `npm install && npx prisma generate && npm run build` |
| **Start Command** | `npx prisma migrate deploy && npm start` |
| **Root Directory** | *(leave blank)* |

---

## STEP 7 — Deploy

1. Click **Deploy** (or it may auto-deploy)
2. Watch the build logs — takes 2–4 minutes
3. When you see `✓ Ready` → your app is live!

---

## STEP 8 — Seed the Database

After the first deploy succeeds, run the seed script to populate sample data:

**Option A — Railway CLI (recommended):**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run seed
railway run npm run db:seed
```

**Option B — Railway Dashboard:**
1. Go to your app service → **Deploy** tab
2. Click **New Deploy** → **Shell**
3. Run: `npm run db:seed`

---

## STEP 9 — Get Your Live URL

1. Go to your app service → **Settings** tab
2. Under **Networking** → **Public Networking** → click **Generate Domain**
3. Your URL will be something like: `https://nexus-taskmanager-production.up.railway.app`

---

## STEP 10 — Update NEXTAUTH_URL

Go back to Variables and update:
```
NEXTAUTH_URL=https://your-actual-url.up.railway.app
ALLOWED_ORIGINS=https://your-actual-url.up.railway.app
```

Then redeploy (Railway auto-redeploys on variable changes).

---

## STEP 11 — Test Your Live App

Open your Railway URL and test:

### Login with demo accounts:

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | alex.liu@nexushq.com | Password123 | Full access |
| **Project Manager** | sarah.chen@nexushq.com | Password123 | Create/assign tasks |
| **Member** | marcus.webb@nexushq.com | Password123 | View/update own tasks |

### Verify all features work:
- [ ] Signup creates new account → redirects to dashboard
- [ ] Login works for all 3 roles
- [ ] Dashboard shows metrics and charts
- [ ] Projects page lists projects, Admin can create new ones
- [ ] Tasks page shows tasks, PM/Admin can create
- [ ] Kanban board shows columns, cards draggable
- [ ] Team page shows all members + permissions table
- [ ] Calendar shows task deadlines
- [ ] Analytics shows charts
- [ ] Workload shows capacity bars
- [ ] Activity Feed shows live log
- [ ] Settings page shows profile
- [ ] Logout works

---

## STEP 12 — GitHub Repo README Update

Update your README.md with the live URL:

```markdown
## 🌐 Live Demo

**URL:** https://your-app.up.railway.app

**Demo accounts:**
- Admin: alex.liu@nexushq.com / Password123
- Manager: sarah.chen@nexushq.com / Password123  
- Member: marcus.webb@nexushq.com / Password123
```

---

## 📦 Submission Package

Collect these for submission:

```
✅ Live URL:   https://your-app.up.railway.app
✅ GitHub:     https://github.com/YOUR_USERNAME/nexus-taskmanager
✅ README:     Included in repo (with live URL + demo credentials)
```

---

## 🔧 Troubleshooting

### Build fails: "Cannot find module @prisma/client"
```
Build Command: npm install && npx prisma generate && npm run build
```
Make sure `prisma generate` runs before `next build`.

### App crashes on start: "relation does not exist"
The DB migrations haven't run. Set Start Command to:
```
npx prisma migrate deploy && npm start
```

### 401 errors on all API calls
Check that `JWT_SECRET` env var is set in Railway Variables.

### Database connection refused
Ensure `DATABASE_URL` uses `${{Postgres.DATABASE_URL}}` — Railway injects this automatically.

### Blank page / no styling
Clear browser cache. Make sure `NODE_ENV=production` is set.

### Seed fails: "User already exists"
The DB was already seeded. This is fine — ignore the error.

---

## 🏗 Architecture Summary

```
User Browser
     ↓
Next.js 15 App (Railway)
     ├── /app/(auth)       → Login, Signup pages
     ├── /app/(dashboard)  → Protected pages (RBAC)
     │     ├── /dashboard  → Metrics + charts
     │     ├── /projects   → Project CRUD
     │     ├── /tasks      → Task list + filters
     │     ├── /kanban     → Drag-and-drop board
     │     ├── /team       → Member management
     │     ├── /analytics  → Recharts dashboards
     │     ├── /workload   → Capacity planning
     │     ├── /calendar   → Deadline view
     │     ├── /activity   → Activity log
     │     └── /settings   → Profile settings
     └── /app/api          → REST API routes
           ├── /auth        → JWT auth (login/signup/refresh)
           ├── /projects    → Project CRUD
           ├── /tasks       → Task CRUD + status
           ├── /users       → User management
           ├── /notifications → Notification system
           ├── /analytics   → Dashboard metrics
           ├── /activity    → Activity log
           └── /health      → Railway healthcheck
     ↓
PostgreSQL (Railway)
via Prisma ORM
```

---

## 🔐 Security Features

- JWT access tokens (15 min expiry) + refresh tokens (7 days)
- HTTP-only secure cookies
- bcrypt password hashing (cost 12)
- Role-based middleware on every protected route
- Zod input validation on all API endpoints
- Prisma parameterized queries (SQL injection safe)
- CORS configured for your domain only
