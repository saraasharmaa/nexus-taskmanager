# NexusHQ 🚀

AI-powered team task management platform built with Next.js, Prisma, PostgreSQL, and Railway.

NexusHQ helps teams manage projects, tasks, workload distribution, analytics, calendars, and collaboration through a modern full-stack dashboard experience.

---

## ✨ Features

- 🔐 JWT Authentication
- 📋 Task Management
- 📁 Project Management
- 🧠 Analytics Dashboard
- 📊 Workload Tracking
- 🗓️ Calendar View
- 🧩 Kanban Board
- 👥 Team Members Dashboard
- 🌙 Modern Dark UI
- ⚡ Real-time Dashboard Experience
- ☁️ Railway Deployment
- 🗄️ PostgreSQL + Prisma ORM

---

## 🛠️ Tech Stack

### Frontend
- Next.js 15
- React
- TypeScript
- TailwindCSS
- Zustand
- Shadcn UI

### Backend
- Prisma ORM
- PostgreSQL
- JWT Authentication
- REST APIs

### Deployment
- Railway
- GitHub

---

## 📂 Core Modules

| Module       | Description                          |
| ------------ | ------------------------------------ |
| Dashboard    | Productivity overview and metrics    |
| Tasks        | Task CRUD management                 |
| Projects     | Project tracking and organization    |
| Kanban       | Drag-and-drop workflow board         |
| Calendar     | Deadline and task scheduling         |
| Analytics    | Productivity and completion insights |
| Workload     | Team utilization tracking            |
| Team Members | Team collaboration overview          |

---

## ⚙️ Local Setup

### 1. Clone Repository

```bash
git clone YOUR_REPO_URL
cd nexus-taskmanager
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Push Prisma Schema

```bash
npx prisma db push
npx prisma generate
```

### 5. Run Application

```bash
npm run dev
```

---

## ☁️ Railway Deployment

This project is deployed using Railway with PostgreSQL integration.

**Deployment flow:**
1. Push changes to GitHub
2. Railway auto-deploys the latest commit
3. Prisma syncs with the PostgreSQL database

---

## 📝 Creating Tasks

To create a new task:

1. Navigate to **My Tasks** from the Workspace sidebar
2. Click the **+ New Task** button at the top-right
3. Select an existing project
4. Fill in:
   - Task title
   - Description
   - Priority
   - Due date
   - Assignee
5. Click **Create Task**

### Important Notes

- A project must already exist before tasks can be created
- Tasks are linked to projects
- Admin accounts have full task creation access
- Analytics and workload features become more useful after multiple tasks are created and assigned

---

## 📊 Analytics & Workload Notes

### Analytics Page

If analytics appears empty initially, this is expected behavior when the database has very little activity data.

Analytics depends on:
- Completed tasks
- Task history
- Multiple task statuses
- Productivity metrics

**To populate analytics**, create 4–5 tasks with different priorities and statuses, then:
- Mark some tasks as `DONE`
- Mark others as `IN_PROGRESS`

The charts and productivity metrics will automatically populate.

---

### Workload Page

Workload tracking depends on:
- Assigned tasks
- Due dates
- Task counts
- Team members

If workload appears empty, it may be because:
- Tasks have not yet been assigned
- There is only one admin user
- Insufficient task distribution exists

**To populate workload data**, create multiple users, multiple assigned tasks, and varied deadlines and statuses. This enables workload balancing calculations and utilization charts.

---

## 🧠 Current Architecture

The application follows a full-stack architecture:

```
Frontend (Next.js)
    ↓
API Routes
    ↓
Prisma ORM
    ↓
PostgreSQL Database
```

---

## 📌 Future Improvements

- [ ] Real-time WebSockets
- [ ] Notifications System
- [ ] File Attachments
- [ ] Team Invitations
- [ ] Activity Feed Enhancements
- [ ] AI Productivity Recommendations

---

## 👨‍💻 Author

Built by **Sara Sharma** 
