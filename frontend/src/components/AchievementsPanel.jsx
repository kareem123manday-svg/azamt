import { Trophy, Lock } from "lucide-react";

export default function AchievementsPanel({ achievements, earned }) {
  return (
    <div className="space-y-2 max-h-[60vh] overflow-y-auto" data-testid="achievements-panel">
      {achievements.map((a) => {
        const got = earned.includes(a.id);
        return (
          <div
            key={a.id}
            data-testid={`achievement-${a.id}`}
            className={`card-3d p-4 flex items-center gap-3 ${got ? "border-amber-400 bg-amber-50" : "opacity-60"}`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${
                got ? "bg-amber-100 border-amber-300" : "bg-gray-100 border-gray-200"
              }`}
              style={{ borderBottomWidth: "4px" }}
            >
              {got ? (
                <img
                  src="https://static.prod-images.emergentagent.com/jobs/3db45a41-af67-44ef-b123-f48c15dbd477/images/6d81bca7c26fad37b6c60078e04b40e1704c15fd7cf88a60a879e8eaa9d82040.png"
                  alt=""
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <Lock className="w-6 h-6 text-gray-400" strokeWidth={2.5} />
              )}
            </div>
            <div className="flex-1">
              <h4 className={`font-black text-base ${got ? "text-amber-800" : "text-gray-600"}`}>{a.title}</h4>
              <p className="text-sm text-gray-500">{a.desc}</p>
            </div>
            {got && <Trophy className="w-6 h-6 text-amber-500 flex-shrink-0" strokeWidth={2.5} />}
          </div>
        );
      })}
    </div>
  );
}
