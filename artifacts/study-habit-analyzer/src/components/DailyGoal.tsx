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
    if (!isNaN(val) && val >= 0.5 && val <= 24) {
      updateGoal.mutate(val, { onSuccess: () => setEditing(false) });
    }
  };

  return (
    <section className="glass-panel p-6 sm:p-8">
      <div className="flex items-center justify-between mb-4">
        {editing ? (
          <form
            onSubmit={(e) => { e.preventDefault(); save(); }}
            className="flex items-center gap-2"
          >
            <span className="font-semibold text-sm">Goal:</span>
            <input
              autoFocus
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
              className="field-input w-20 text-center py-1.5 text-sm"
              data-testid="input-edit-goal"
            />
            <span className="text-muted-foreground text-sm">hrs</span>
            <button
              type="submit"
              disabled={updateGoal.isPending}
              className="p-1.5 rounded-lg transition-colors"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              data-testid="button-save-goal"
            >
              <Check size={14} />
            </button>
          </form>
        ) : (
          <button
            className="flex items-center gap-2 group"
            onClick={() => { setInput(String(goalHours)); setEditing(true); }}
            data-testid="text-daily-goal"
          >
            <h2 className="text-lg font-bold">
              🎯 Daily Goal:{" "}
              <span style={{ color: "hsl(var(--primary))" }}>{goalHours} hrs</span>
            </h2>
            <Edit2
              size={13}
              className="text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity"
            />
          </button>
        )}
        <span className="text-sm font-semibold text-muted-foreground">
          {todayHours.toFixed(1)} / {goalHours} hrs
        </span>
      </div>

      <div className="progress-track" data-testid="progress-goal">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      {pct >= 100 && (
        <p className="text-center text-sm font-semibold mt-3" style={{ color: "#4ade80" }}>
          🎉 Goal reached for today!
        </p>
      )}
    </section>
  );
}
