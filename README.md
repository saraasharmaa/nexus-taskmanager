# ============================================================
# NexusHQ Team Task Manager
# Production-grade SaaS built with Next.js 15 + PostgreSQL
# ============================================================

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, ShadCN UI |
| State | Zustand, TanStack Query (React Query) |
| Animation | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Backend | Next.js API Routes, JWT Auth |
| Database | PostgreSQL + Prisma ORM |
| Deployment | Railway |

---

## 📁 Folder Structure

```
nexus-taskmanager/
├── prisma/
│   ├── schema.prisma          # Full database schema
│   └── seed.ts                # Sample data seeder
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── projects/      # Project management
│   │   │   ├── tasks/         # Task list view
│   │   │   ├── kanban/        # Drag-and-drop kanban
│   │   │   ├── calendar/      # Calendar view
│   │   │   ├── analytics/     # Analytics & charts
│   │   │   ├── workload/      # Workload management
│   │   │   ├── team/          # Team management
│   │   │   ├── activity/      # Activity feed
│   │   │   └── settings/      # Workspace settings
│   │   ├── (auth)/            # Login/signup pages
│   │   └── api/               # REST API routes
│   │       ├── auth/          # JWT auth endpoints
│   │       ├── projects/      # Project CRUD
│   │       ├── tasks/         # Task CRUD
│   │       ├── users/         # User management
│   │       ├── notifications/ # Notifications
│   │       ├── analytics/     # Dashboard analytics
│   │       └── activity/      # Activity log
│   ├── components/
│   │   ├── layout/            # Sidebar, Topbar, NotifPanel
│   │   ├── dashboard/         # Metric cards, charts
│   │   ├── projects/          # Project cards, forms
│   │   ├── tasks/             # Task cards, kanban
│   │   ├── team/              # Member cards
│   │   ├── providers/         # Query, Theme providers
│   │   └── ui/                # Shared UI components
│   ├── hooks/
│   │   └── use-queries.ts     # TanStack Query hooks
│   ├── lib/
│   │   ├── prisma.ts          # DB client singleton
│   │   ├── auth.ts            # JWT utilities
│   │   ├── api-client.ts      # Axios client
│   │   ├── api-utils.ts       # Response helpers
│   │   └── validations.ts     # Zod schemas
│   ├── store/
│   │   ├── auth.store.ts      # Zustand auth state
│   │   └── ui.store.ts        # Zustand UI state
│   └── types/
│       └── index.ts           # TypeScript interfaces
├── .env.example               # Environment template
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🛠 Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

```bash
# 1. Clone and install
git clone https://github.com/yourusername/nexus-taskmanager
cd nexus-taskmanager
npm install

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET

# 3. Setup database
npm run db:push        # Create tables
npm run db:seed        # Seed sample data

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Sample Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | alex.liu@nexushq.com | Password123 |
| Project Manager | sarah.chen@nexushq.com | Password123 |
| Member | marcus.webb@nexushq.com | Password123 |

---

## 🚂 Railway Deployment

### One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

### Manual Deployment

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and init
railway login
railway init

# 3. Add PostgreSQL
railway add postgresql

# 4. Set environment variables in Railway dashboard:
#    DATABASE_URL        → auto-set by Railway PostgreSQL plugin
#    JWT_SECRET          → generate: openssl rand -base64 64
#    JWT_REFRESH_SECRET  → generate: openssl rand -base64 64
#    NODE_ENV            → production
#    NEXTAUTH_URL        → https://your-app.railway.app

# 5. Deploy
railway up
```

### Build & Start Commands

```bash
Build:  prisma generate && next build
Start:  next start
```

### railway.toml

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
restartPolicyType = "ON_FAILURE"
```

---

## 🔐 Security

- ✅ JWT access tokens (15 min) + refresh tokens (7 days)
- ✅ bcrypt password hashing (cost factor 12)
- ✅ RBAC middleware (Admin / Project Manager / Member)
- ✅ HTTP-only cookies for token storage
- ✅ Zod input validation on all endpoints
- ✅ Prisma parameterized queries (SQL injection prevention)
- ✅ CORS configuration
- ✅ Rate limiting (in-memory, Redis-ready)
- ✅ Audit trail for all entity mutations

---

## 📊 Features

### Role-Based Access Control
| Feature | Admin | PM | Member |
|---|---|---|---|
| Manage users | ✓ | — | — |
| Create projects | ✓ | — | — |
| Manage teams | ✓ | — | — |
| View org analytics | ✓ | — | — |
| Create/assign tasks | ✓ | ✓ | — |
| Monitor performance | ✓ | ✓ | — |
| Update task progress | ✓ | ✓ | ✓ |
| Add comments | ✓ | ✓ | ✓ |
| View assigned tasks | ✓ | ✓ | ✓ |

### Analytics
- Task completion velocity (8-week trend)
- Team workload & capacity utilization
- Project health scoring (composite algorithm)
- Risk detection (overdue, deadline proximity)
- AI-generated productivity insights
- Priority & status distribution charts

---

## 🔌 API Documentation

### Base URL
```
https://your-app.railway.app/api
```

### Authentication
```
POST /api/auth/login         # Login
POST /api/auth/signup        # Register
POST /api/auth/logout        # Logout
POST /api/auth/refresh       # Refresh token
```

### Projects
```
GET    /api/projects          # List projects (paginated)
POST   /api/projects          # Create project [Admin, PM]
GET    /api/projects/:id      # Get project with tasks
PUT    /api/projects/:id      # Update project [Admin, PM]
DELETE /api/projects/:id      # Delete project [Admin]
```

### Tasks
```
GET    /api/tasks             # List tasks (filterable)
POST   /api/tasks             # Create task [Admin, PM]
GET    /api/tasks/:id         # Get task detail
PUT    /api/tasks/:id         # Update task
PATCH  /api/tasks/:id/status  # Update status only
DELETE /api/tasks/:id         # Delete task [Admin, PM]
```

### Analytics
```
GET /api/analytics/dashboard   # Full dashboard data
GET /api/analytics/productivity # Productivity metrics
GET /api/analytics/workload    # Team workload data
```

### Notifications
```
GET   /api/notifications        # List notifications
PATCH /api/notifications        # Mark all read
PATCH /api/notifications/:id   # Mark one read
```

---

## 🎨 Design System

Built on ShadCN UI + Tailwind with custom Nexus tokens:
- **Font**: DM Sans (UI) + DM Mono (code)
- **Dark mode**: First-class, system-aware
- **Colors**: 9-ramp palette with semantic tokens
- **Animations**: Framer Motion with staggered page reveals
- **Icons**: Lucide React

---

## 📜 License

MIT — built for portfolio & learning purposes.
