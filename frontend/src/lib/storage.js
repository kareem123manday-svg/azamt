// LocalStorage helpers for the Islamic planner
const KEYS = {
  TASKS: "salah_first_tasks",
  STATS: "salah_first_stats",
  LOCATION: "salah_first_location",
  PRAYERS_DONE: "salah_first_prayers_done",
  USER: "salah_first_user",
  HISTORY: "salah_first_history",
};

export const todayKey = () => new Date().toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

// Tasks: array of { id, title, slot, done, createdAt }
// slot: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'night'
export const getTasks = () => {
  try {
    const all = JSON.parse(localStorage.getItem(KEYS.TASKS) || "{}");
    return all[todayKey()] || [];
  } catch {
    return [];
  }
};

export const saveTasks = (tasks) => {
  const all = JSON.parse(localStorage.getItem(KEYS.TASKS) || "{}");
  all[todayKey()] = tasks;
  // Keep only last 30 days
  const keys = Object.keys(all).sort().slice(-30);
  const trimmed = {};
  keys.forEach((k) => (trimmed[k] = all[k]));
  localStorage.setItem(KEYS.TASKS, JSON.stringify(trimmed));
};

export const getPrayersDone = () => {
  try {
    const all = JSON.parse(localStorage.getItem(KEYS.PRAYERS_DONE) || "{}");
    return all[todayKey()] || {};
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
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
    const allTasks = JSON.parse(localStorage.getItem(KEYS.TASKS) || "{}");
    const allPrayers = JSON.parse(localStorage.getItem(KEYS.PRAYERS_DONE) || "{}");
    const tasks = allTasks[dateKey] || [];
    const prayers = allPrayers[dateKey] || {};
    const tasksDone = tasks.filter((t) => t.done).length;
    const prayersDone = Object.values(prayers).filter(Boolean).length;
    const xpEarned = tasksDone * 10 + prayersDone * 20;
    const history = getHistory();
    history[dateKey] = {
      tasksTotal: tasks.length,
      tasksDone,
      prayersDone,
      xpEarned,
    };
    saveHistory(history);
    return history[dateKey];
  } catch {
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
