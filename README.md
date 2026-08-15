# 🕷️ Spider-Verse

A local **Time Management & Focus Tracking App** with a Spider-Man / Miles Morales dark theme and per-user accounts. Track your focus sessions, manage tasks, and stay locked in.

### Features

- **Accounts** — sign up with a username/password; every user gets their own topics, tasks, sessions, and settings
- **Focus Mode** — full-screen distraction-free timer with task management, optional Pomodoro cycle
- **Dashboard** — Spider figure with Persian date, session launcher, daily progress, and inline topic/task manager
- **Analytics** — weekly, monthly, and all-time focus stats with interactive charts (Jalali calendar)
- **Session Logs** — history of all sessions with search, date filters, and editing

### Quick Start

```bash
npm install
# add DATABASE_URL to .env (Postgres on Supabase)
npm run prisma:migrate
npm run dev
```

Opens at **http://localhost:5173** — desktop only.

### Production Build

```bash
npm run build
```

Static files are output to `dist/`. Serve the API separately with `npm run dev:server`.

### Autostart on Login

A startup script and autostart entry are already configured:

```bash
~/.config/autostart/spider-verse.desktop   # runs start.sh on login
./start.sh                                # manual start
```

### Stack

React 19, Vite 8, TypeScript, Tailwind CSS v4, Express 5, Prisma 5 + Postgres (Supabase), Recharts, Lucide

### Database

PostgreSQL hosted on Supabase — connection string in `.env` (`DATABASE_URL`). Manage with `npx prisma studio`.
