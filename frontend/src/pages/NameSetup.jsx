import { useState } from "react";
import { User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initUser } from "@/lib/storage";
import { toast } from "sonner";

export default function NameSetup({ onDone, onBack }) {
  const [name, setName] = useState("");

  const submit = () => {
    if (!name.trim()) {
      toast.error("أدخل اسمك من فضلك");
      return;
    }
    const user = initUser(name);
    toast.success(`أهلاً بك يا ${user.name}`);
    onDone(user);
  };

  return (
    <div className="min-h-screen islamic-pattern flex items-center justify-center p-4" data-testid="name-setup-page">
      <div className="w-full max-w-md">
        {onBack && (
          <button
            onClick={onBack}
            data-testid="name-back-btn"
            className="mb-3 flex items-center gap-1 text-gray-500 hover:text-gray-700 font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            رجوع
          </button>
        )}
        <div className="bg-white border-2 border-gray-200 border-b-4 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl border-2 border-emerald-300 border-b-4 flex items-center justify-center mb-3">
              <User className="w-8 h-8 text-emerald-600" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-2">ما اسمك؟</h1>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              حتى نرحّب بك كل يوم عند العودة
            </p>
          </div>

          <div className="space-y-3">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="اسمك هنا..."
              data-testid="user-name-input"
              maxLength={40}
              className="rounded-2xl border-2 border-gray-200 text-lg h-14 text-center font-bold"
            />
            <Button
              onClick={submit}
              disabled={!name.trim()}
              data-testid="save-name-btn"
              className="w-full bg-[#1CB05B] hover:bg-[#179B4F] text-white border-b-4 border-[#148643] active:border-b-2 active:translate-y-[2px] rounded-2xl px-6 py-6 font-bold text-base btn-3d disabled:opacity-50"
            >
              متابعة
            </Button>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          يُحفظ اسمك في جهازك فقط ولا يُرسل لأي خادم.
        </p>
      </div>
    </div>
  );
}
