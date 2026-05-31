import { Sunrise, Sun, CloudSun, Sunset, Moon, Check } from "lucide-react";

const ICONS = { Sunrise, Sun, CloudSun, Sunset, Moon };

export default function PrayerCard({ prayer, time, done, isCurrent, isPast, onToggle }) {
  const Icon = ICONS[prayer.icon] || Sun;
  return (
    <div
      className={`relative card-3d p-4 flex items-center gap-3 ${isCurrent ? "border-emerald-500 border-b-4 ring-2 ring-emerald-100" : ""} ${done ? "bg-emerald-50" : ""}`}
      data-testid={`prayer-card-${prayer.key}`}
    >
      <div
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center ${prayer.bgClass} border-2 ${prayer.borderClass} flex-shrink-0`}
        style={{ borderBottomWidth: "4px" }}
      >
        <Icon className={`w-7 h-7 ${prayer.textClass}`} strokeWidth={2.5} />
        {isCurrent && (
          <span className="absolute -top-1 -end-1 w-3 h-3 bg-emerald-500 rounded-full pulse-glow border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h3 className="text-lg md:text-xl font-black text-gray-800">{prayer.name}</h3>
          {isCurrent && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              الآن
            </span>
          )}
        </div>
        <p className={`text-2xl font-black ${prayer.textClass} tabular-nums`} data-testid={`prayer-time-${prayer.key}`}>
          {time || "--:--"}
        </p>
      </div>
      <button
        onClick={onToggle}
        data-testid={`toggle-prayer-${prayer.key}`}
        aria-label={`تسجيل صلاة ${prayer.name}`}
        className={`flex-shrink-0 w-12 h-12 rounded-2xl border-2 border-b-4 flex items-center justify-center font-bold btn-3d transition-colors ${
          done
            ? "bg-[#1CB05B] border-[#148643] text-white"
            : "bg-white border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-500"
        }`}
      >
        <Check className="w-6 h-6" strokeWidth={3} />
      </button>
    </div>
  );
}
