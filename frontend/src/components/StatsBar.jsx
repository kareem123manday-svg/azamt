import { Flame, Sparkles, Clock } from "lucide-react";

const formatCountdown = (mins) => {
  if (mins == null) return "--";
  if (mins < 60) return `${mins} د`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} س ${m} د`;
};

export default function StatsBar({ stats, nextPrayer }) {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3" data-testid="stats-bar">
      <div className="bg-white border-2 border-gray-200 border-b-4 rounded-2xl p-3 flex flex-col items-center justify-center">
        <div className="flex items-center gap-1 text-orange-500">
          <Flame className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-2xl font-black tabular-nums" data-testid="streak-value">{stats.streak || 0}</span>
        </div>
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">أيام متتالية</span>
      </div>

      <div className="bg-white border-2 border-gray-200 border-b-4 rounded-2xl p-3 flex flex-col items-center justify-center">
        <div className="flex items-center gap-1 text-amber-500">
          <Sparkles className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-2xl font-black tabular-nums" data-testid="xp-value">{stats.xp || 0}</span>
        </div>
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">نقطة خبرة</span>
      </div>

      <div className="bg-white border-2 border-gray-200 border-b-4 rounded-2xl p-3 flex flex-col items-center justify-center">
        <div className="flex items-center gap-1 text-emerald-600">
          <Clock className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-base font-black" data-testid="next-prayer-time">{nextPrayer?.time || "--:--"}</span>
        </div>
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">
          {nextPrayer ? `${nextPrayer.name} بعد ${formatCountdown(nextPrayer.minutesUntil)}` : "الصلاة القادمة"}
        </span>
      </div>
    </div>
  );
}
