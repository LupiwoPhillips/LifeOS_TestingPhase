# Life OS

Life OS is a personal growth app designed to help you build a better life,
not just complete tasks. Instead of a generic red badge when you miss
something, it reflects on your own progress and writes a short, specific
message back to you — based on your journal entries, goals, and streaks.

Mobile-first, dark by default, backed by Supabase (Postgres + Auth) with
row-level security so every user only ever sees their own data.

## Features

- Personalized reminders generated from your own tasks, journal, goals and streaks
- Daily check-ins (mood, energy, stress, gratitude)
- Journal with life-area and mood tagging
- Goal tracking with progress
- Habit tracking with streaks
- Task management
- A Life Score built from six life areas (Spiritual, Mental, Career, Fitness, Relationships, Finance)
- Full account management (edit profile, change password, sign out everywhere)

## Getting Started

### 1. Set up Supabase

Create a project at [supabase.com](https://supabase.com), then open the
**SQL Editor** and run everything in [`supabase/schema.sql`](./supabase/schema.sql).
That single file creates every table the app needs, turns on row-level
security, and adds a trigger so new signups automatically get a starting
Life Score.

### 2. Configure environment variables

Copy your project's URL and anon key (Project Settings → API) into `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open the local URL shown in your terminal (usually `http://localhost:5173`).
For the best experience, view the app on a narrow screen or in your
browser's mobile device mode.

### 4. Enable email confirmations (optional)

By default Supabase requires email verification before sign-in. You can
turn this off for local testing under Authentication → Providers → Email,
or leave it on for production.

---

## Project Structure

```text
src/
├── components/      Reusable UI (Modal, EmptyState, TaskItem, forms, nav…)
├── pages/           Each application screen
├── context/         Global state — auth, app data, toasts
├── services/
│   ├── api.js              Core Supabase data layer + Life Score side effects
│   ├── authService.js      Sign in / up / out, password reset & change
│   ├── dashboardService.js Loads everything needed for one screen paint
│   └── streakService.js    Computes streaks from tasks/checkins/journal/habits
├── lib/
│   ├── smartReminder.js    The nudge-generation engine (see below)
│   ├── lifeScore.js        Pure scoring helpers
│   └── insightEngine.js    "AI Coach" insight generation
└── styles/
    ├── variables.css   Design tokens — colors, spacing, radii
    └── global.css      Shared component classes (buttons, cards, forms)

supabase/
└── schema.sql       Tables, RLS policies, and the new-user trigger
```

---

## Smart Reminder Engine

The heart of Life OS is `src/lib/smartReminder.js`.

Rather than showing a generic notification when you miss a task, it builds
a personalized message by looking at:

- missed tasks
- journal entries in the same life area
- active streaks
- goal progress

Depending on how long a task has been overdue, the tone shifts from gentle
encouragement to a firmer, more direct nudge. If you've written something
relevant in your journal, the reminder references your own words back to you.

The engine is deliberately framework-free and rule-based so it runs
instantly offline. It's written as a drop-in point for a future LLM-backed
version — swap the body of `generateNudges` for a call to an endpoint that
runs the same inputs through a model, and nothing else in the app needs to
change.

---

## Design

Life OS uses a dark interface with a consistent color system. Each life
area has its own signature color, defined once in `src/styles/variables.css`:

- Spiritual — blue
- Fitness — green
- Career — purple
- Mental — orange
- Relationships — pink
- Finance — yellow

Updating these tokens automatically updates the entire app's appearance —
buttons, progress bars, badges, and charts all read from the same palette.

---

## Security

Every table in `supabase/schema.sql` has Row Level Security enabled with
policies scoped to `auth.uid() = user_id`, so the anon key that ships in
the client can never read or write another user's data. Deleting a user's
`auth.users` row cascades to delete all of their app data.

---

## Vision

Life OS is built around a simple idea:

> Don't just track your life. Understand it.

The goal is a personal operating system that helps you reflect, grow, and
stay aligned with the life you're intentionally building.
