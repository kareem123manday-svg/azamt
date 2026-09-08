import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Flame, Sparkles, MapPin, Settings, Plus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getTasks,
  saveTasks,
  getStats,
  saveStats,
  bumpStreak,
  addXP,
  getPrayersDone,
  savePrayersDone,
  checkNewDay,
  todayKey,
} from "@/lib/storage";
import { PRAYERS, SLOTS, getCurrentSlot, getNextPrayer } from "@/lib/prayers";
import PrayerCard from "@/components/PrayerCard";
import TaskCard from "@/components/TaskCard";
import AddTaskDialog from "@/components/AddTaskDialog";
import StatsBar from "@/components/StatsBar";
import AchievementsPanel from "@/components/AchievementsPanel";
import Confetti from "@/components/Confetti";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ACHIEVEMENTS = [
  { id: "first_prayer", title: "البداية المباركة", desc: "أكمل أول صلاة", check: (s) => s.totalPrayersDone >= 1 },
  { id: "five_pillars", title: "أركان اليوم", desc: "أكمل الصلوات الخمس في يوم واحد", check: (s, todayP) => Object.values(todayP).filter(Boolean).length >= 5 },
  { id: "streak_3", title: "ثلاثة أيام متتالية", desc: "حافظ على ٣ أيام متتالية", check: (s) => s.streak >= 3 },
  { id: "streak_7", title: "أسبوع كامل", desc: "حافظ على ٧ أيام متتالية", check: (s) => s.streak >= 7 },
  { id: "ten_tasks", title: "إنجاز ١٠ مهام", desc: "أكمل ١٠ مهام بنجاح", check: (s) => s.totalTasksDone >= 10 },
  { id: "xp_100", title: "١٠٠ نقطة خبرة", desc: "اجمع ١٠٠ نقطة خبرة", check: (s) => s.xp >= 100 },
];

export default function HomePage({ user, location, onChangeLocation, onChangeUser }) {
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState(getTasks());
  const [stats, setStats] = useState(getStats());
  const [prayersDone, setPrayersDone] = useState(getPrayersDone());
  const [showAchievements, setShowAchievements] = useState(false);
  const [newDayInfo, setNewDayInfo] = useState(null);
  const [currentDate, setCurrentDate] = useState(todayKey());
  const [addOpen, setAddOpen] = useState(false);
  const [addSlot, setAddSlot] = useState(null);
  const [confetti, setConfetti] = useState(0);

  // Fetch prayer times
  useEffect(() => {
    const fetchTimes = async () => {
      setLoading(true);
      try {
        const url = location.type === "coords" ? `${API}/prayer-times` : `${API}/prayer-times/by-city`;
        const params =
          location.type === "coords"
            ? { latitude: location.latitude, longitude: location.longitude, method: 4 }
            : { city: location.city, country: location.country, method: 4 };
        const res = await axios.get(url, { params });
        setTimes(res.data);
      } catch (e) {
        toast.error("تعذّر جلب أوقات الصلاة");
      } finally {
        setLoading(false);
      }
    };
    fetchTimes();
  }, [location, currentDate]);

  // New day detection: on mount, on visibility, and every 60s
  useEffect(() => {
    const handleDayCheck = () => {
      const info = checkNewDay();
      const nowKey = todayKey();
      if (info.isNewDay) {
        setNewDayInfo(info);
        setTasks(getTasks());
        setPrayersDone(getPrayersDone());
        setStats(getStats());
        setCurrentDate(nowKey);
        if (info.streakBroken) {
          toast.warning("انقطعت سلسلة أيامك، لا بأس! ابدأ من جديد اليوم", { duration: 5000 });
        } else {
          toast.success("يوم جديد مبارك! أعدّ خطتك واكسب النقاط", { duration: 4000 });
        }
      } else if (nowKey !== currentDate) {
        // Date rolled over silently – re-sync
        setCurrentDate(nowKey);
        setTasks(getTasks());
        setPrayersDone(getPrayersDone());
      }
    };
    handleDayCheck();
    const onVisible = () => document.visibilityState === "visible" && handleDayCheck();
    document.addEventListener("visibilitychange", onVisible);
    const interval = setInterval(handleDayCheck, 60000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(interval);
    };
  }, [currentDate]);

  const currentSlot = useMemo(() => (times ? getCurrentSlot(times) : "fajr"), [times]);
  const nextPrayer = useMemo(() => (times ? getNextPrayer(times) : null), [times]);

  // Achievements check
  const checkAchievements = useCallback((newStats, newPrayersDone) => {
    const earned = newStats.achievements || [];
    const newly = [];
    ACHIEVEMENTS.forEach((a) => {
      if (!earned.includes(a.id) && a.check(newStats, newPrayersDone)) {
        newly.push(a);
      }
    });
    if (newly.length) {
      const updated = { ...newStats, achievements: [...earned, ...newly.map((n) => n.id)] };
      saveStats(updated);
      setStats(updated);
      newly.forEach((a) => {
        toast.success(`🏆 إنجاز جديد: ${a.title}`, { description: a.desc, duration: 4000 });
      });
    }
  }, []);

  const triggerConfetti = () => setConfetti((c) => c + 1);

  // Check if the day is fully complete: all 5 prayers done AND all tasks done
  const isDayComplete = (t, p) => {
    const allPrayers = Object.values(p).filter(Boolean).length >= 5;
    const allTasks = t.length === 0 || t.every((task) => task.done);
    return allPrayers && allTasks;
  };

  // Called after any toggle - bumps streak once if day just became complete
  const maybeCompleteDay = (nextTasks, nextPrayers) => {
    if (!isDayComplete(nextTasks, nextPrayers)) return;
    const before = getStats();
    if (before.lastActiveDate === todayKey()) return; // already counted today
    const after = bumpStreak();
    setStats(after);
    triggerConfetti();
    setTimeout(triggerConfetti, 300);
    setTimeout(triggerConfetti, 600);
    toast.success("🎉 اكتمل يومك!", {
      description: `أتممت كل صلواتك وأعمالك — سلسلتك الآن ${after.streak} يوم${after.streak > 2 ? "اً" : ""}`,
      duration: 5000,
    });
    checkAchievements(after, nextPrayers);
  };

  const handlePrayerToggle = (key) => {
    const next = { ...prayersDone, [key]: !prayersDone[key] };
    setPrayersDone(next);
    savePrayersDone(next);

    if (next[key]) {
      const newStats = addXP(20);
      newStats.totalPrayersDone = (newStats.totalPrayersDone || 0) + 1;
      saveStats(newStats);
      setStats(newStats);
      triggerConfetti();
      const prayerName = PRAYERS.find((p) => p.key === key)?.name;
      toast.success(`أحسنت! تم تسجيل صلاة ${prayerName}`, { description: "+٢٠ نقطة خبرة" });
      checkAchievements(newStats, next);
      maybeCompleteDay(tasks, next);
    } else {
      const latest = getStats();
      const newStats = { ...latest, xp: Math.max(0, latest.xp - 20), totalPrayersDone: Math.max(0, (latest.totalPrayersDone || 0) - 1) };
      saveStats(newStats);
      setStats(newStats);
    }
  };

  const handleAddTask = (title, slot) => {
    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      slot,
      done: false,
      createdAt: Date.now(),
    };
    const next = [...tasks, newTask];
    setTasks(next);
    saveTasks(next);
    toast.success("تمت إضافة المهمة");
  };

  const handleToggleTask = (id) => {
    const next = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTasks(next);
    saveTasks(next);
    const task = next.find((t) => t.id === id);
    if (task.done) {
      const newStats = addXP(10);
      newStats.totalTasksDone = (newStats.totalTasksDone || 0) + 1;
      saveStats(newStats);
      setStats(newStats);
      triggerConfetti();
      toast.success("أحسنت! +١٠ نقاط خبرة");
      checkAchievements(newStats, prayersDone);
      maybeCompleteDay(next, prayersDone);
    } else {
      const latest = getStats();
      const newStats = { ...latest, xp: Math.max(0, latest.xp - 10), totalTasksDone: Math.max(0, (latest.totalTasksDone || 0) - 1) };
      saveStats(newStats);
      setStats(newStats);
    }
  };

  const handleDeleteTask = (id) => {
    const next = tasks.filter((t) => t.id !== id);
    setTasks(next);
    saveTasks(next);
  };

  const handleMoveTask = (id, dir) => {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx < 0) return;
    const sameSlotIdxs = tasks.map((t, i) => (t.slot === tasks[idx].slot ? i : -1)).filter((i) => i >= 0);
    const posInSlot = sameSlotIdxs.indexOf(idx);
    const newPosInSlot = posInSlot + dir;
    if (newPosInSlot < 0 || newPosInSlot >= sameSlotIdxs.length) return;
    const swapWithIdx = sameSlotIdxs[newPosInSlot];
    const next = [...tasks];
    [next[idx], next[swapWithIdx]] = [next[swapWithIdx], next[idx]];
    setTasks(next);
    saveTasks(next);
  };

  const tasksBySlot = useMemo(() => {
    const map = { fajr: [], dhuhr: [], asr: [], maghrib: [], isha: [] };
    tasks.forEach((t) => {
      if (map[t.slot]) map[t.slot].push(t);
    });
    return map;
  }, [tasks]);

  const dayProgress = useMemo(() => {
    const prayersCount = Object.values(prayersDone).filter(Boolean).length;
    const tasksDoneCount = tasks.filter((t) => t.done).length;
    return {
      done: prayersCount + tasksDoneCount,
      total: 5 + tasks.length,
    };
  }, [tasks, prayersDone]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="home-loading">
        <div className="text-emerald-600 font-bold text-xl">جارٍ جلب أوقات الصلاة...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" data-testid="home-page">
      <Confetti trigger={confetti} />

      {/* Header */}
      <header className="bg-white border-b-2 border-gray-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src="https://static.prod-images.emergentagent.com/jobs/3db45a41-af67-44ef-b123-f48c15dbd477/images/320e1e78428b4201bf3882ef0bea0895701c1a18547a4e5452505a025d98ba89.png"
              alt="logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <button
                type="button"
                onClick={() => {
                  const newName = prompt("عدّل اسمك:", user?.name || "");
                  if (newName && newName.trim()) {
                    const updated = { ...user, name: newName.trim() };
                    localStorage.setItem("salah_first_user", JSON.stringify(updated));
                    onChangeUser?.(updated);
                    toast.success("تم تحديث اسمك");
                  }
                }}
                className="text-base md:text-lg font-black text-gray-800 leading-tight hover:text-emerald-600 transition-colors text-right"
                data-testid="greeting"
                aria-label="تعديل الاسم"
              >
                أهلاً، {user?.name || "بك"} 👋
              </button>
              <p className="text-xs text-gray-500 leading-tight">{times?.date_hijri}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAchievements(true)}
              data-testid="open-achievements-btn"
              className="bg-amber-50 border-2 border-amber-200 border-b-4 hover:border-amber-400 rounded-xl px-3 py-1.5 flex items-center gap-1 btn-3d"
              aria-label="الإنجازات"
            >
              <Trophy className="w-4 h-4 text-amber-600" strokeWidth={2.5} />
              <span className="font-bold text-amber-700 text-sm">{stats.achievements?.length || 0}</span>
            </button>
            <button
              onClick={onChangeLocation}
              data-testid="change-location-btn"
              className="bg-white border-2 border-gray-200 border-b-4 hover:border-emerald-400 rounded-xl px-3 py-1.5 flex items-center gap-1 btn-3d"
              aria-label="تغيير الموقع"
            >
              <MapPin className="w-4 h-4 text-gray-600" strokeWidth={2.5} />
              <span className="font-bold text-gray-700 text-sm hidden sm:inline">{location.label}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4">
        <StatsBar stats={stats} nextPrayer={nextPrayer} dayProgress={dayProgress} />

        <div className="mt-6 space-y-1" data-testid="timeline">
          {PRAYERS.map((prayer, idx) => {
            const isPast = times && currentSlot && PRAYERS.findIndex((p) => p.key === currentSlot) > idx;
            const isCurrent = currentSlot === prayer.key;
            const slotTasks = tasksBySlot[prayer.key] || [];
            return (
              <div key={prayer.key}>
                <PrayerCard
                  prayer={prayer}
                  time={times?.[prayer.key]}
                  done={!!prayersDone[prayer.key]}
                  isCurrent={isCurrent}
                  isPast={isPast}
                  onToggle={() => handlePrayerToggle(prayer.key)}
                />
                <div className="ps-6 pe-2 py-2 space-y-2 border-s-4 border-dashed border-gray-200 ms-5 -mt-1 mb-2 min-h-[40px]">
                  {slotTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={() => handleToggleTask(task.id)}
                      onDelete={() => handleDeleteTask(task.id)}
                      onMoveUp={() => handleMoveTask(task.id, -1)}
                      onMoveDown={() => handleMoveTask(task.id, 1)}
                    />
                  ))}
                  <button
                    onClick={() => {
                      setAddSlot(prayer.key);
                      setAddOpen(true);
                    }}
                    data-testid={`add-task-after-${prayer.key}`}
                    className="w-full bg-transparent hover:bg-emerald-50 border-2 border-dashed border-gray-300 hover:border-emerald-400 text-gray-500 hover:text-emerald-700 rounded-xl py-2 text-sm font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    أضف عملاً {SLOTS.find((s) => s.key === prayer.key)?.label}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8 mb-4 text-gray-400 text-sm font-arabic">
          ﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾
        </div>
      </main>

      {/* Floating add button */}
      <button
        onClick={() => {
          setAddSlot(currentSlot);
          setAddOpen(true);
        }}
        data-testid="floating-add-btn"
        className="fixed bottom-6 start-6 bg-[#1CB05B] hover:bg-[#179B4F] text-white border-b-4 border-[#148643] active:border-b-0 active:translate-y-[3px] rounded-2xl px-5 py-3 font-bold shadow-lg flex items-center gap-2 btn-3d z-20"
      >
        <Plus className="w-5 h-5" strokeWidth={3} />
        مهمة جديدة
      </button>

      <AddTaskDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultSlot={addSlot}
        onAdd={handleAddTask}
      />

      <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
        <DialogContent className="max-w-md" dir="rtl" data-testid="achievements-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-800 text-center">الإنجازات</DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-500">إنجازاتك المكتسبة من إكمال الصلوات والمهام</DialogDescription>
          </DialogHeader>
          <AchievementsPanel achievements={ACHIEVEMENTS} earned={stats.achievements || []} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!newDayInfo} onOpenChange={(o) => !o && setNewDayInfo(null)}>
        <DialogContent className="max-w-sm rounded-3xl" dir="rtl" data-testid="new-day-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-emerald-700 text-center">🌅 يوم جديد</DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-500">
              مرحباً بك يا {user?.name} في يومك الجديد
            </DialogDescription>
          </DialogHeader>
          {newDayInfo?.yesterdaySummary && (
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 space-y-2" data-testid="yesterday-summary">
              <p className="font-bold text-emerald-800 text-sm text-center">ملخص أمس:</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-black text-emerald-700">{newDayInfo.yesterdaySummary.prayersDone}/5</p>
                  <p className="text-[11px] font-bold text-gray-500">صلوات</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-700">
                    {newDayInfo.yesterdaySummary.tasksDone}/{newDayInfo.yesterdaySummary.tasksTotal}
                  </p>
                  <p className="text-[11px] font-bold text-gray-500">مهام</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-600">+{newDayInfo.yesterdaySummary.xpEarned}</p>
                  <p className="text-[11px] font-bold text-gray-500">خبرة</p>
                </div>
              </div>
            </div>
          )}
          {newDayInfo?.streakBroken && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-3 text-center">
              <p className="text-sm font-bold text-orange-700">انقطعت سلسلتك، لا بأس - كل يوم فرصة جديدة</p>
            </div>
          )}
          <Button
            onClick={() => setNewDayInfo(null)}
            data-testid="dismiss-new-day-btn"
            className="w-full bg-[#1CB05B] hover:bg-[#179B4F] text-white border-b-4 border-[#148643] active:border-b-0 active:translate-y-[3px] rounded-2xl font-bold py-5"
          >
            هيّا نبدأ اليوم
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
