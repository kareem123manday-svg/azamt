// LocalStorage helpers for the Islamic planner
const KEYS = {
  TASKS: "salah_first_tasks",
  STATS: "salah_first_stats",
  LOCATION: "salah_first_location",
  PRAYERS_DONE: "salah_first_prayers_done",
};

const todayKey = () => new Date().toISOString().slice(0, 10);

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
