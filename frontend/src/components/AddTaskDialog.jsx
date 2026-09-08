import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SLOTS, WEEK_DAYS } from "@/lib/prayers";

const SUGGESTIONS = [
  "قراءة وِرد القرآن",
  "أذكار الصباح",
  "أذكار المساء",
  "صلاة الضحى",
  "مذاكرة درس",
  "ممارسة الرياضة",
  "صلة الرحم",
  "قيام الليل",
];

const REPEAT_PRESETS = [
  { key: "everyday", label: "كل يوم", days: null },
  { key: "friday", label: "الجمعة فقط", days: [5] },
  { key: "weekdays", label: "أيام العمل", days: [0, 1, 2, 3, 4] },
  { key: "custom", label: "أيام محددة", days: [] },
];

export default function AddTaskDialog({ open, onOpenChange, defaultSlot, onAdd, initialTask }) {
  const [title, setTitle] = useState("");
  const [slot, setSlot] = useState(defaultSlot || "fajr");
  const [repeatMode, setRepeatMode] = useState("everyday");
  const [customDays, setCustomDays] = useState([]);

  useEffect(() => {
    if (!open) return;
    if (initialTask) {
      setTitle(initialTask.title || "");
      setSlot(initialTask.slot || defaultSlot || "fajr");
      if (!initialTask.days || initialTask.days.length === 0 || initialTask.days.length === 7) {
        setRepeatMode("everyday");
        setCustomDays([]);
      } else if (initialTask.days.length === 1 && initialTask.days[0] === 5) {
        setRepeatMode("friday");
        setCustomDays([5]);
      } else if (initialTask.days.length === 5 && [0, 1, 2, 3, 4].every((d) => initialTask.days.includes(d))) {
        setRepeatMode("weekdays");
        setCustomDays([0, 1, 2, 3, 4]);
      } else {
        setRepeatMode("custom");
        setCustomDays([...initialTask.days]);
      }
    } else {
      setTitle("");
      setSlot(defaultSlot || "fajr");
      setRepeatMode("everyday");
      setCustomDays([]);
    }
  }, [open, defaultSlot, initialTask]);

  const toggleDay = (dayKey) => {
    setRepeatMode("custom");
    setCustomDays((prev) => (prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]));
  };

  const submit = () => {
    if (!title.trim()) return;
    let days = null;
    if (repeatMode === "everyday") days = null;
    else if (repeatMode === "friday") days = [5];
    else if (repeatMode === "weekdays") days = [0, 1, 2, 3, 4];
    else days = customDays.length ? [...customDays].sort() : null;
    onAdd({ title: title.trim(), slot, days });
    onOpenChange(false);
  };

  const activeDays = repeatMode === "everyday"
    ? []
    : repeatMode === "friday"
    ? [5]
    : repeatMode === "weekdays"
    ? [0, 1, 2, 3, 4]
    : customDays;

  const isEditing = !!initialTask;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl max-h-[92vh] overflow-y-auto" dir="rtl" data-testid="add-task-dialog">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-gray-800 text-right">
            {isEditing ? "تعديل مهمة" : "عمل جديد"}
          </DialogTitle>
          <DialogDescription className="text-right text-sm text-gray-500">
            {isEditing ? "عدّل تفاصيل مهمتك" : "أضف مهمة جديدة بين الصلوات لتنظيم يومك"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">ماذا تريد أن تفعل؟</label>
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="مثال: قراءة جزء من القرآن"
              data-testid="task-title-input"
              className="rounded-xl border-2 border-gray-200 text-base h-12"
            />
            {!isEditing && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTitle(s)}
                    className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold border border-emerald-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">متى ستفعله؟</label>
            <div className="grid grid-cols-5 gap-1.5">
              {SLOTS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSlot(s.key)}
                  data-testid={`slot-${s.key}`}
                  className={`text-xs font-bold py-2 px-1 rounded-xl border-2 border-b-4 btn-3d ${
                    slot === s.key
                      ? "bg-[#1CB05B] border-[#148643] text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300"
                  }`}
                >
                  {s.label.replace("بعد ", "")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">تكرار المهمة</label>
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {REPEAT_PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    setRepeatMode(p.key);
                    if (p.days) setCustomDays(p.days);
                    else if (p.key === "custom") setCustomDays([]);
                  }}
                  data-testid={`repeat-${p.key}`}
                  className={`text-xs font-bold py-2 px-2 rounded-xl border-2 border-b-4 btn-3d ${
                    repeatMode === p.key
                      ? "bg-[#1CB05B] border-[#148643] text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1" data-testid="days-picker">
              {WEEK_DAYS.map((d) => {
                const active = activeDays.includes(d.key);
                const disabled = repeatMode !== "custom" && repeatMode !== "everyday";
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleDay(d.key)}
                    data-testid={`day-${d.key}`}
                    aria-label={d.label}
                    className={`aspect-square rounded-lg border-2 border-b-4 font-black text-sm btn-3d transition-colors ${
                      active
                        ? "bg-emerald-500 border-emerald-700 text-white"
                        : repeatMode === "everyday"
                        ? "bg-emerald-100 border-emerald-200 text-emerald-700"
                        : "bg-white border-gray-200 text-gray-500 hover:border-emerald-300"
                    } ${disabled ? "opacity-70" : ""}`}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              {repeatMode === "everyday"
                ? "ستظهر هذه المهمة كل يوم"
                : activeDays.length === 0
                ? "اختر يوماً واحداً على الأقل، أو اختر «كل يوم»"
                : `ستظهر: ${WEEK_DAYS.filter((d) => activeDays.includes(d.key)).map((d) => d.label).join("، ")}`}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              data-testid="cancel-add-task-btn"
              className="flex-1 bg-white text-gray-700 border-2 border-gray-200 border-b-4 hover:bg-gray-50 active:border-b-2 active:translate-y-[2px] rounded-xl font-bold"
            >
              إلغاء
            </Button>
            <Button
              onClick={submit}
              disabled={!title.trim() || (repeatMode === "custom" && customDays.length === 0)}
              data-testid="submit-task-btn"
              className="flex-1 bg-[#1CB05B] hover:bg-[#179B4F] text-white border-b-4 border-[#148643] active:border-b-0 active:translate-y-[3px] rounded-xl font-bold disabled:opacity-50"
            >
              {isEditing ? "حفظ" : "إضافة"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
