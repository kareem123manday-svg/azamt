import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SLOTS } from "@/lib/prayers";

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

export default function AddTaskDialog({ open, onOpenChange, defaultSlot, onAdd }) {
  const [title, setTitle] = useState("");
  const [slot, setSlot] = useState(defaultSlot || "fajr");

  useEffect(() => {
    if (open) {
      setTitle("");
      setSlot(defaultSlot || "fajr");
    }
  }, [open, defaultSlot]);

  const submit = () => {
    if (!title.trim()) return;
    onAdd(title, slot);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl" dir="rtl" data-testid="add-task-dialog">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-gray-800 text-right">عمل جديد</DialogTitle>
          <DialogDescription className="text-right text-sm text-gray-500">أضف مهمة جديدة بين الصلوات لتنظيم يومك</DialogDescription>
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
              disabled={!title.trim()}
              data-testid="submit-task-btn"
              className="flex-1 bg-[#1CB05B] hover:bg-[#179B4F] text-white border-b-4 border-[#148643] active:border-b-0 active:translate-y-[3px] rounded-xl font-bold disabled:opacity-50"
            >
              إضافة
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
