# Spider-Verse

A local, single-user Time Management, Focus Tracking, and Task App. Spider-Man / Miles Morales dark theme.

## Quick Start

```bash
npm install
npm run dev
```

This starts both the Express API server (port 3001) and Vite dev server (port 5173) concurrently.
Open `http://localhost:5173` in a desktop browser.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 + TypeScript |
| Styling | Tailwind CSS v4 (Vite plugin) |
| Icons | Lucide React |
| Charts | Recharts |
| Backend | Express 5 (TypeScript via `tsx`) |
| Database | PostgreSQL via Supabase + Prisma ORM 5 |
| Auth | Username/password (scrypt hashing, opaque bearer tokens) |
| Dev runner | `concurrently` |

## Project Structure

```
.
├── prisma/
│   └── schema.prisma          # DB models: User, AuthToken, Topic, Task, Session, AppSetting
├── server/
│   ├── index.ts               # Express entry (port 3001)
│   ├── db.ts                  # Prisma client singleton (loads .env)
│   ├── middleware/
│   │   └── auth.ts            # requireAuth (Bearer token → req.user)
│   ├── utils/
│   │   ├── jalali.ts          # Jalali calendar helpers (month start/length, weekdays)
│   │   ├── password.ts        # scrypt hash/verify
│   │   └── tokens.ts          # opaque auth token generator
│   └── routes/
│       ├── auth.ts            # register/login/me/logout (public: register, login)
│       ├── topics.ts          # CRUD for topics (user-scoped)
│       ├── tasks.ts           # CRUD for tasks (user-scoped)
│       ├── sessions.ts        # CRUD for sessions + filters (user-scoped)
│       ├── analytics.ts       # Aggregated stats (user-scoped)
│       └── settings.ts        # Key-value app settings (user-scoped)
├── src/
│   ├── main.tsx               # App entry with AuthProvider + BrowserRouter
│   ├── App.tsx                # Routes: /login (public) + guarded /, /analytics, /sessions
│   ├── index.css              # Tailwind + custom theme
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── context/
│   │   └── AuthContext.tsx    # AuthProvider + useAuth (login/register/logout)
│   ├── utils/
│   │   ├── formatTime.ts      # Time formatting + Persian date converter
│   │   └── sounds.ts          # Web Audio API sound effects
│   ├── hooks/
│   │   ├── useApi.ts          # Typed fetch wrapper (get/post/put/del)
│   │   ├── useTimer.ts        # Count-up stopwatch hook
│   │   ├── useCountdown.ts    # Generic countdown hook
│   │   └── usePomodoro.ts     # Focus/break phase machine (auto-cycle)
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Layout.tsx     # Shell with sidebar
│   │   │   └── Sidebar.tsx    # Nav: Dashboard, Analytics, Session Logs + Start Focus
│   │   ├── Dashboard/
│   │   │   ├── FigureDisplay.tsx   # Spider figure + Persian date
│   │   │   ├── FocusLauncher.tsx   # Topic dropdown + Enter Focus button
│   │   │   ├── PomodoroSettings.tsx # Pomodoro toggle + focus/break duration inputs
│   │   │   └── TodayProgress.tsx   # Daily report with hours & percentages
│   │   ├── FocusMode/
│   │   │   └── FocusOverlay.tsx    # Full-screen timer + task panel
│   │   ├── Analytics/
│   │   │   ├── MetricCards.tsx      # 4 metric cards + period tabs
│   │   │   ├── ChartView.tsx       # Recharts bar chart (per topic)
│   │   │   └── DailyChart.tsx      # Recharts bar chart (per day, weekly/monthly)
│   │   ├── SessionLogs/
│   │   │   ├── SessionTable.tsx     # Sessions table
│   │   │   ├── SessionFilters.tsx   # Search + date range
│   │   │   └── EditSessionModal.tsx # Edit session modal
│   │   └── Topics/
│   │       ├── TopicCards.tsx       # Topic CRUD grid (emoji text input)
│   │       └── TaskList.tsx         # Per-topic task manager
│   └── pages/
│       ├── LoginPage.tsx      # Login / create-account screen (public)
│       ├── DashboardPage.tsx    # Main hub: figure, focus launcher, daily report, topics
│       ├── AnalyticsPage.tsx    # Charts & metrics
│       └── SessionLogsPage.tsx  # Session history & editing
├── public/
│   ├── icon.png
│   ├── figure.png
│   └── font/                    # KalamehWeb fonts (loaded via @font-face)
└── start.sh                     # Startup script (API + Vite + browser)
```

## Design Tokens

- **Background**: `#000000` (void-deeper), `#0a0a0a` (void)
- **Primary Accent**: `#e3363f` (spider-red)
- **Cards/Surfaces**: `#18181B`, `#27272A`, `#3F3F46`
- **Text**: `#FAFAFA` (white), `#71717A` (zinc-500 muted)
- **Font**: Space Grotesk (Google Fonts, weights 300–700)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account `{ username, password }` → `{ token, user }` (public) |
| POST | `/api/auth/login` | Login → `{ token, user }` (public) |
| GET | `/api/auth/me` | Current user (auth) |
| POST | `/api/auth/logout` | Invalidate token (auth) |
| GET | `/api/topics` | List all topics (with tasks and session count) |
| POST | `/api/topics` | Create topic `{ name, emoji }` |
| PUT | `/api/topics/:id` | Update topic |
| DELETE | `/api/topics/:id` | Delete topic (cascades tasks & sessions) |
| GET | `/api/tasks` | List tasks (optional `?topicId=`) |
| POST | `/api/tasks` | Create task `{ title, topicId }` |
| PUT | `/api/tasks/:id` | Update task (toggle `completed` or rename) |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/sessions` | List sessions (filters: `topicId`, `startDate`, `endDate`, `search`) |
| POST | `/api/sessions` | Create session `{ topicId, startTime, endTime, duration }` |
| PUT | `/api/sessions/:id` | Edit session (auto-recalculates `duration`) |
| DELETE | `/api/sessions/:id` | Delete session |
| GET | `/api/analytics` | Aggregated stats `?period=weekly\|monthly\|all` (per-topic breakdowns + per-day `dailyBreakdown` for weekly/monthly) |
| GET | `/api/settings` | Read app settings (pomodoro durations) |
| PUT | `/api/settings` | Update app settings (pomodoro durations) |

## Useful Commands

```bash
npm run dev              # Start both servers concurrently
npm run dev:server       # Start only Express API
npm run dev:vite         # Start only Vite frontend
npm run build            # Production build (tsc + vite)
npm run prisma:studio    # Open Prisma Studio (DB browser)
npm run prisma:migrate   # Run pending migrations
npm run lint             # Lint with oxlint
```

## Key Design Decisions

- **Desktop only** — no responsive breakpoints. Designed for desktop screens.
- **Multi-user auth** — every account has its own topics/tasks/sessions/settings; all data is scoped by `userId` server-side. Bearer token stored in localStorage (via `Authorization` header), validated on app load.
- **Persian calendar** — dashboard date shown in Jalali format (e.g., "8 Mordad 1405"). Analytics weeks start on Saturday (Shanbe) and monthly reports reset on the Jalali month boundary.
- **Custom emoji input** — users type their own emoji for topics (not a dropdown).
- **Inline topic manager** — topic CRUD and task management live on the dashboard in a dedicated box.
- **Vite proxy** — `/api` requests proxied to Express on port 3001 in dev mode.
- **Count-up timer** — focus mode uses a stopwatch (not countdown). Timers are wall-clock based (`baseSeconds` + `runStartedAt`), so they stay accurate in background tabs and can be restored.
- **Session recovery** — the running focus session is snapshotted to localStorage (`spiderverse.activeSession`, scoped by `userId`). Closing/reloading the site keeps the timer counting; on next load the app auto-reopens focus mode and it continues. Finishing writes the elapsed time as a normal session and clears the snapshot.
- **Pomodoro mode** — optional focus/break countdown cycle (durations from `/api/settings`). When enabled, focus sessions auto-save on completion, a repeating beep plays, and a panel appears forcing the user to press "Start Break"/"Start Next Focus" or "End Session" before continuing. When disabled, focus mode is the plain count-up stopwatch.
- **SQLite** — zero-config database, file stored at `prisma/dev.db`.
- **Web Audio API sounds** — hover/click/enter/exit focus mode use synthesized oscillator tones.
