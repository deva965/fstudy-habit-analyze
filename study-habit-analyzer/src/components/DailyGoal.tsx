import { useState } from "react";
import { Check, Edit2 } from "lucide-react";
import { useAnalytics, useGoal, useUpdateGoal } from "../hooks";

export function DailyGoal() {
  const { data: analytics } = useAnalytics();
  const { data: goal } = useGoal();
  const updateGoal = useUpdateGoal();

  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");

  const goalHours = goal?.dailyGoalHours ?? analytics?.goalHours ?? 5;
  const todayHours = analytics?.todayHours ?? 0;
  const pct = goalHours > 0 ? Math.min(100, (todayHours / goalHours) * 100) : 0;

  const save = () => {
    const val = parseFloat(input);
    if (!isNaN(val) && val > 0 && val <= 24) {
      updateGoal.mutate(val, { onSuccess: () => setEditing(false) });
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") setEditing(false);
  };

  return (
    <section className="glass p-6 sm:p-8">
      <div className="flex items-center justify-between mb-5">
        {editing ? (
          <div className="flex items-center gap-2">
            <span className="font-semibold">Daily Goal:</span>
            <input
              autoFocus
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              className="field-input w-20 text-center py-1"
            />
            <span className="text-white/60 font-medium">hrs</span>
            <button
              onClick={save}
              disabled={updateGoal.isPending}
              className="btn-primary p-1.5 rounded-lg"
              aria-label="Save goal"
            >
              <Check size={16} />
            </button>
          </div>
        ) : (
          <button
            className="flex items-center gap-2 group"
            onClick={() => {
              setInput(String(goalHours));
              setEditing(true);
            }}
          >
            <h2 className="section-title mb-0">
              🎯 Daily Goal:{" "}
              <span className="accent-text">{goalHours} hrs</span>
            </h2>
            <Edit2
              size={14}
              className="text-white/20 group-hover:text-white/60 transition-colors"
            />
          </button>
        )}
        <div className="text-sm font-bold text-white/70">
          {todayHours.toFixed(1)} / {goalHours} hrs
        </div>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {pct >= 100 && (
        <p className="text-green-400 text-sm font-semibold mt-3 text-center">
          🎉 Goal reached for today!
        </p>
      )}
    </section>
  );
}
