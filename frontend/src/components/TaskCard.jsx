import { Check, Trash2, ChevronUp, ChevronDown, Pencil, CalendarDays } from "lucide-react";
import { daysLabel } from "@/lib/prayers";

export default function TaskCard({ task, onToggle, onDelete, onEdit, onMoveUp, onMoveDown }) {
  const isRecurringSpecific = task.days && task.days.length > 0 && task.days.length < 7;
  return (
    <div
      className={`card-3d p-3 flex items-center gap-2 ${task.done ? "bg-emerald-50 border-emerald-200" : ""}`}
      data-testid={`task-card-${task.id}`}
    >
      <button
        onClick={onToggle}
        data-testid={`toggle-task-${task.id}`}
        aria-label={task.done ? "إلغاء الإكمال" : "إكمال المهمة"}
        className={`flex-shrink-0 w-10 h-10 rounded-xl border-2 border-b-4 flex items-center justify-center btn-3d ${
          task.done
            ? "bg-[#1CB05B] border-[#148643] text-white"
            : "bg-white border-gray-200 text-transparent hover:border-emerald-300"
        }`}
      >
        <Check className="w-5 h-5" strokeWidth={3} />
      </button>
      <div
        onClick={onEdit}
        className="flex-1 min-w-0 cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") onEdit?.(); }}
        data-testid={`task-body-${task.id}`}
      >
        <p
          className={`font-bold text-sm md:text-base leading-snug truncate ${
            task.done ? "line-through text-gray-400" : "text-gray-700"
          }`}
        >
          {task.title}
        </p>
        {isRecurringSpecific && (
          <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
            <CalendarDays className="w-3 h-3" strokeWidth={2.5} />
            {daysLabel(task.days)}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <button
          onClick={onMoveUp}
          data-testid={`task-up-${task.id}`}
          aria-label="نقل لأعلى"
          className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700"
        >
          <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <button
          onClick={onMoveDown}
          data-testid={`task-down-${task.id}`}
          aria-label="نقل لأسفل"
          className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700"
        >
          <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
      <button
        onClick={onEdit}
        data-testid={`edit-task-${task.id}`}
        aria-label="تعديل"
        className="w-8 h-8 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-gray-300 hover:text-emerald-600"
      >
        <Pencil className="w-4 h-4" strokeWidth={2.5} />
      </button>
      <button
        onClick={onDelete}
        data-testid={`delete-task-${task.id}`}
        aria-label="حذف المهمة"
        className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500"
      >
        <Trash2 className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
