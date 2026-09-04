# منظم الصلاة — Islamic Daily Planner (PRD)

## Original Problem Statement
اصنع موقع لصنع خطط يومية. تكون الصلوات هي الاساس فيه. فعندما يدخل المستخدم يستطيع اضافة الاعمال التي يريد فعلها ويرتبها كما يريد. اريد الستايل اسلامي بسيط مثل دولينغو. اذا اضفت صور ذوات ارواح لا تضع ملامح لهم لانه حرام.

## User Choices (verbatim)
- Prayer times: automatic via Aladhan API + geolocation/city picker
- Auth: none — localStorage only
- Style: Duolingo-style points/achievements/streaks
- Language: Arabic only (RTL)
- Color: Islamic green

## Architecture
- **Backend (FastAPI)**: only proxies Aladhan public API
  - `GET /api/prayer-times?latitude&longitude&method`
  - `GET /api/prayer-times/by-city?city&country&method`
- **Frontend (React + Tailwind + shadcn)**: single-page app, RTL, Tajawal font
- **Storage**: all user data in localStorage (tasks, prayers done, stats, user profile, history)

## User Personas
- Muslim adult wanting to structure daily tasks around the 5 prayers
- Prefers Arabic UI, minimal & fun
- Wants gentle gamification to build habits

## Core Requirements (static)
1. Prayer times fetched by location — the 5 daily prayers are the day's anchors
2. Users add/reorder/delete tasks under each prayer slot
3. Prayers and tasks can be marked done; XP + streak awarded
4. Achievements unlock as user progresses
5. No facial features on any image (religious requirement)
6. Islamic green theme, Tajawal Arabic font, Duolingo-style tactile UI (border-b-4)

## Implemented (2026-02)
- Onboarding flow: **NameSetup → LocationSetup → HomePage**
- Prayer timeline with 5 cards, current-prayer highlight, sunrise/sunset icons
- Task CRUD per prayer slot with reorder buttons and slot picker
- Stats bar (streak, XP, next prayer countdown)
- Achievements dialog (6 initial badges: first prayer, five pillars, streak-3/7, 10-tasks, 100-XP)
- Confetti celebration on completions, sonner toasts
- Popular-cities preset + custom city + geolocation
- Location & name editable (name via header click)
- **User profile stored in localStorage** (name, joinedAt, lastSeenDate)
- **New-day detection**: on mount / visibility change / every 60s
  - Archives previous day → history (tasksTotal, tasksDone, prayersDone, xpEarned)
  - Shows "يوم جديد" dialog with yesterday's summary
  - Resets streak if gap > 1 day (with warning toast)
  - Auto-refreshes tasks/prayers view for new day

## Testing Status
- Iteration 1: found 3 minor issues (fixed: prayer toggle click target, submit testid, dialog description)
- Iteration 2: 100% backend + 100% frontend pass — all onboarding, prayer/task XP, achievements, change-location, new-day detection verified

## Prioritized Backlog
- P1: Weekly stats page (7-day history bar chart)
- P1: Adhan notifications when a prayer time enters
- P2: Morning/evening adhkar (أذكار) built-in checklist
- P2: Task templates ("قراءة القرآن", "أذكار الصباح", etc.) with recurrence
- P2: Multiple calculation methods selector (Umm Al-Qura, ISNA, MWL...)
- P3: Optional cloud sync / login
- P3: PWA install + offline support

## Next Tasks
- Weekly progress chart (uses existing history data already being archived)
- Prayer time notifications via Notification API
- Adhkar module (post-Fajr / post-Maghrib checklists)
