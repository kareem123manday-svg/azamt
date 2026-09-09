// LocalStorage helpers for the Islamic planner
const KEYS = {
  TASKS: "salah_first_tasks",
  STATS: "salah_first_stats",
  LOCATION: "salah_first_location",
  PRAYERS_DONE: "salah_first_prayers_done",
  USER: "salah_first_user",
  HISTORY: "salah_first_history",
  TASK_DONE: "salah_first_task_done", // per-day map of {taskId: true}
};

export const todayKey = () => new Date().toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

/**
 * Storage security note: this app is intentionally client-only (no auth,
 * no server-side accounts, no PII). Values here (name, tasks, prayer/task
 * done flags, streaks) are user-owned local data. localStorage is the right
 * tool for the job. The try/catch wrappers below guard against corrupted
 * JSON only; we log to the console for debuggability.
 */
const warn = (context, err) => {
  // eslint-disable-next-line no-console
  console.warn(`[storage] ${context}:`, err);
};

// --- One-time migration: convert legacy per-day tasks format to global list ---
const migrateTasksIfNeeded = () => {
  try {
    const raw = localStorage.getItem(KEYS.TASKS);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    // Legacy format was { "YYYY-MM-DD": [ ... ] }. New format is an array.
    if (Array.isArray(parsed)) return;
    if (parsed && typeof parsed === "object") {
      const dates = Object.keys(parsed).sort();
      const latest = dates.length ? parsed[dates[dates.length - 1]] : [];
      const globalTasks = (latest || []).map((t) => ({
        id: t.id,
        title: t.title,
        slot: t.slot,
        createdAt: t.createdAt || Date.now(),
      }));
      localStorage.setItem(KEYS.TASKS, JSON.stringify(globalTasks));
    }
  } catch (err) {
    warn('migrate', err);
  }
};
migrateTasksIfNeeded();

// Tasks now GLOBAL: array of { id, title, slot, createdAt }
// The "done" state is stored per-day in TASK_DONE
export const getTasksList = () => {
  try {
    const list = JSON.parse(localStorage.getItem(KEYS.TASKS) || "[]");
    return Array.isArray(list) ? list : [];
  } catch (err) {
    warn('getTasksList', err);
    return [];
  }
};

export const saveTasksList = (tasks) => {
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
};

// Per-day done map: { "YYYY-MM-DD": { taskId: true } }
export const getTaskDoneMap = () => {
  try {
    const all = JSON.parse(localStorage.getItem(KEYS.TASK_DONE) || "{}");
    return all[todayKey()] || {};
  } catch (err) {
    warn("getTaskDoneMap", err);
    return {};
  }
};

export const saveTaskDoneMap = (doneMap) => {
  const all = JSON.parse(localStorage.getItem(KEYS.TASK_DONE) || "{}");
  all[todayKey()] = doneMap;
  // Keep last 60 days
  const keys = Object.keys(all).sort().slice(-60);
  const trimmed = {};
  keys.forEach((k) => (trimmed[k] = all[k]));
  localStorage.setItem(KEYS.TASK_DONE, JSON.stringify(trimmed));
};

// Returns today's tasks merged with per-day done state
export const getTasks = () => {
  const list = getTasksList();
  const doneMap = getTaskDoneMap();
  return list.map((t) => ({ ...t, done: !!doneMap[t.id] }));
};

// Persist: split tasks into definition list + today's done map
export const saveTasks = (tasks) => {
  const list = tasks.map(({ id, title, slot, days, createdAt }) => ({
    id,
    title,
    slot,
    days: days ?? null,
    createdAt: createdAt || Date.now(),
  }));
  saveTasksList(list);
  const doneMap = {};
  tasks.forEach((t) => {
    if (t.done) doneMap[t.id] = true;
  });
  saveTaskDoneMap(doneMap);
};

export const getPrayersDone = () => {
  try {
    const all = JSON.parse(localStorage.getItem(KEYS.PRAYERS_DONE) || "{}");
    return all[todayKey()] || {};
  } catch (err) {
    warn("getPrayersDone", err);
    return {};
  }
};

export const savePrayersDone = (prayersDone) => {
  const all = JSON.parse(localStorage.getItem(KEYS.PRAYERS_DONE) || "{}");
  all[todayKey()] = prayersDone;
  localStorage.setItem(KEYS.PRAYERS_DONE, JSON.stringify(all));
};

// Stats: { xp, streak, lastActiveDate, totalTasksDone, totalPrayersDone, achievements: [] }
const DEFAULT_STATS = {
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  totalTasksDone: 0,
  totalPrayersDone: 0,
  achievements: [],
};

export const getStats = () => {
  try {
    const s = JSON.parse(localStorage.getItem(KEYS.STATS) || "null");
    return { ...DEFAULT_STATS, ...(s || {}) };
  } catch (err) {
    warn("getStats", err);
    return { ...DEFAULT_STATS };
  }
};

export const saveStats = (stats) => {
  localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
};

export const bumpStreak = () => {
  const stats = getStats();
  const today = todayKey();
  if (stats.lastActiveDate === today) return stats;
  // Check if yesterday
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (stats.lastActiveDate === yesterday) {
    stats.streak += 1;
  } else {
    stats.streak = 1;
  }
  stats.lastActiveDate = today;
  saveStats(stats);
  return stats;
};

export const addXP = (amount) => {
  const stats = getStats();
  stats.xp += amount;
  saveStats(stats);
  return stats;
};

export const getLocation = () => {
  try {
    return JSON.parse(localStorage.getItem(KEYS.LOCATION) || "null");
  } catch (err) {
    warn("getLocation", err);
    return null;
  }
};

export const saveLocation = (loc) => {
  localStorage.setItem(KEYS.LOCATION, JSON.stringify(loc));
};

export const resetAllData = () => {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
};

// ---------------------------------------------------------------------------
// User profile (name, joined date, last seen day)
// ---------------------------------------------------------------------------
const DEFAULT_USER = { name: "", joinedAt: null, lastSeenDate: null };

export const getUser = () => {
  try {
    const u = JSON.parse(localStorage.getItem(KEYS.USER) || "null");
    return { ...DEFAULT_USER, ...(u || {}) };
  } catch (err) {
    warn("getUser", err);
    return { ...DEFAULT_USER };
  }
};

export const saveUser = (user) => {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const initUser = (name) => {
  const now = new Date().toISOString();
  const user = { name: name.trim(), joinedAt: now, lastSeenDate: todayKey() };
  saveUser(user);
  return user;
};

// ---------------------------------------------------------------------------
// Daily history & new-day detection
// ---------------------------------------------------------------------------
// history: { [dateKey]: { tasksTotal, tasksDone, prayersDone, xpEarned } }
export const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(KEYS.HISTORY) || "{}");
  } catch (err) {
    warn("getHistory", err);
    return {};
  }
};

const saveHistory = (history) => {
  const keys = Object.keys(history).sort().slice(-60);
  const trimmed = {};
  keys.forEach((k) => (trimmed[k] = history[k]));
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(trimmed));
};

// Archive a specific day's activity into history (called when day rolls over)
const archiveDay = (dateKey) => {
  try {
    const tasksList = getTasksList();
    const allTaskDone = JSON.parse(localStorage.getItem(KEYS.TASK_DONE) || "{}");
    const allPrayers = JSON.parse(localStorage.getItem(KEYS.PRAYERS_DONE) || "{}");
    const doneMap = allTaskDone[dateKey] || {};
    const prayers = allPrayers[dateKey] || {};
    const tasksDone = tasksList.filter((t) => doneMap[t.id]).length;
    const prayersDone = Object.values(prayers).filter(Boolean).length;
    const xpEarned = tasksDone * 10 + prayersDone * 20;
    const history = getHistory();
    history[dateKey] = {
      tasksTotal: tasksList.length,
      tasksDone,
      prayersDone,
      xpEarned,
    };
    saveHistory(history);
    return history[dateKey];
  } catch (err) {
    warn("archiveDay", err);
    return null;
  }
};

/**
 * Detect if a new day has started since last visit.
 * Returns { isNewDay: bool, yesterdaySummary, streakBroken }
 */
export const checkNewDay = () => {
  const user = getUser();
  const today = todayKey();
  const lastSeen = user.lastSeenDate;

  if (!lastSeen) {
    saveUser({ ...user, lastSeenDate: today });
    return { isNewDay: false, yesterdaySummary: null, streakBroken: false };
  }
  if (lastSeen === today) {
    return { isNewDay: false, yesterdaySummary: null, streakBroken: false };
  }

  // Day has changed – archive the previous day and update streak
  const yesterdaySummary = archiveDay(lastSeen);
  const gap = daysBetween(lastSeen, today);

  const stats = getStats();
  let streakBroken = false;

  if (gap > 1) {
    // Missed one or more days – streak resets
    if (stats.streak > 0) streakBroken = true;
    stats.streak = 0;
    stats.lastActiveDate = null;
    saveStats(stats);
  }

  saveUser({ ...user, lastSeenDate: today });
  return { isNewDay: true, yesterdaySummary, streakBroken, previousDate: lastSeen };
};
