import { Check, Trash2, ChevronUp, ChevronDown } from "lucide-react";

export default function TaskCard({ task, onToggle, onDelete, onMoveUp, onMoveDown }) {
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
      <p
        className={`flex-1 font-bold text-sm md:text-base leading-snug ${
          task.done ? "line-through text-gray-400" : "text-gray-700"
        }`}
      >
        {task.title}
      </p>
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
