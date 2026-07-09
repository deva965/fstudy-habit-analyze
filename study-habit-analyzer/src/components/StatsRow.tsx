import { useAnalytics } from "../hooks";

export function StatsRow() {
  const { data: analytics, isLoading } = useAnalytics();

  const score = analytics?.productivityScore ?? 0;
  const streak = analytics?.streakDays ?? 0;
  const goalMet = analytics?.dailyGoalMet ?? false;
  const weeklyHours = analytics?.weeklyHours ?? 0;

  const stats = [
    {
      icon: "📊",
      label: "Productivity",
      value: isLoading ? "—" : `${Math.round(score)}/100`,
      color: "#00d4ff",
    },
    {
      icon: "🔥",
      label: "Streak",
      value: isLoading ? "—" : `${streak} day${streak !== 1 ? "s" : ""}`,
      color: "#fb923c",
    },
    {
      icon: "🎯",
      label: "Today's Goal",
      value: isLoading ? "—" : goalMet ? "✅" : "❌",
      color: goalMet ? "#4ade80" : "#f87171",
    },
    {
      icon: "📅",
      label: "This Week",
      value: isLoading ? "—" : `${weeklyHours.toFixed(1)} hrs`,
      color: "#a78bfa",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="glass p-4 sm:p-5 flex flex-col items-center text-center"
        >
          <div className="text-xl mb-1">{s.icon}</div>
          <div
            className="stat-value mb-1"
            style={{ color: s.color }}
          >
            {s.value}
          </div>
          <div className="text-xs text-white/50 font-medium uppercase tracking-wide">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
