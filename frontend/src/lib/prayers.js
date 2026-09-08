// Prayer metadata in Arabic
export const PRAYERS = [
  { key: "fajr", name: "الفجر", color: "#38BDF8", bgClass: "bg-sky-100", textClass: "text-sky-700", borderClass: "border-sky-300", icon: "Sunrise" },
  { key: "dhuhr", name: "الظهر", color: "#FBBF24", bgClass: "bg-amber-100", textClass: "text-amber-700", borderClass: "border-amber-300", icon: "Sun" },
  { key: "asr", name: "العصر", color: "#FB923C", bgClass: "bg-orange-100", textClass: "text-orange-700", borderClass: "border-orange-300", icon: "CloudSun" },
  { key: "maghrib", name: "المغرب", color: "#F87171", bgClass: "bg-red-100", textClass: "text-red-700", borderClass: "border-red-300", icon: "Sunset" },
  { key: "isha", name: "العشاء", color: "#6366F1", bgClass: "bg-indigo-100", textClass: "text-indigo-700", borderClass: "border-indigo-300", icon: "Moon" },
];

export const SLOTS = [
  { key: "fajr", label: "بعد الفجر" },
  { key: "dhuhr", label: "بعد الظهر" },
  { key: "asr", label: "بعد العصر" },
  { key: "maghrib", label: "بعد المغرب" },
  { key: "isha", label: "بعد العشاء" },
];

// Days of week - JS Date.getDay(): 0=Sun ... 6=Sat
// Displayed ordering starts Saturday (Arab week convention)
export const WEEK_DAYS = [
  { key: 6, label: "السبت", short: "س" },
  { key: 0, label: "الأحد", short: "ح" },
  { key: 1, label: "الاثنين", short: "ن" },
  { key: 2, label: "الثلاثاء", short: "ث" },
  { key: 3, label: "الأربعاء", short: "ر" },
  { key: 4, label: "الخميس", short: "خ" },
  { key: 5, label: "الجمعة", short: "ج" },
];

export const todayDayOfWeek = () => new Date().getDay();

// A task is active today if it has no `days` restriction OR today is included
export const isTaskActiveToday = (task, day = todayDayOfWeek()) => {
  if (!task.days || !Array.isArray(task.days) || task.days.length === 0) return true;
  return task.days.includes(day);
};

export const daysLabel = (days) => {
  if (!days || days.length === 0 || days.length === 7) return "كل يوم";
  if (days.length === 1) return WEEK_DAYS.find((d) => d.key === days[0])?.label || "";
  return WEEK_DAYS.filter((d) => days.includes(d.key)).map((d) => d.short).join("، ");
};

// Convert HH:MM to minutes since midnight
export const toMinutes = (hhmm) => {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const currentMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

// Determine current prayer slot
export const getCurrentSlot = (times) => {
  if (!times) return "fajr";
  const now = currentMinutes();
  const fajr = toMinutes(times.fajr);
  const dhuhr = toMinutes(times.dhuhr);
  const asr = toMinutes(times.asr);
  const maghrib = toMinutes(times.maghrib);
  const isha = toMinutes(times.isha);
  if (now < fajr) return "isha";
  if (now < dhuhr) return "fajr";
  if (now < asr) return "dhuhr";
  if (now < maghrib) return "asr";
  if (now < isha) return "maghrib";
  return "isha";
};

// Get next prayer info (key, name, time, minutes until)
export const getNextPrayer = (times) => {
  if (!times) return null;
  const now = currentMinutes();
  for (const p of PRAYERS) {
    const t = toMinutes(times[p.key]);
    if (t > now) {
      return { ...p, time: times[p.key], minutesUntil: t - now };
    }
  }
  // After Isha, next is Fajr tomorrow
  const fajrTomorrow = toMinutes(times.fajr) + 24 * 60;
  return { ...PRAYERS[0], time: times.fajr, minutesUntil: fajrTomorrow - now };
};
