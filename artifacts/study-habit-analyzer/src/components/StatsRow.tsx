import { useAnalytics } from "../hooks";

export function StatsRow() {
  const { data: analytics, isLoading } = useAnalytics();

  const stats = [
    {
      icon: "📊",
      label: "Productivity",
      value: isLoading ? "—" : `${Math.round(analytics?.productivityScore ?? 0)}/100`,
      color: "hsl(var(--primary))",
    },
    {
      icon: "🔥",
      label: "Streak",
      value: isLoading ? "—" : `${analytics?.streakDays ?? 0}d`,
      color: "#fb923c",
    },
    {
      icon: "🎯",
      label: "Today's Goal",
      value: isLoading ? "—" : (analytics?.dailyGoalMet ? "✅" : "❌"),
      color: analytics?.dailyGoalMet ? "#4ade80" : "#f87171",
    },
    {
      icon: "📅",
      label: "This Week",
      value: isLoading ? "—" : `${(analytics?.weeklyHours ?? 0).toFixed(1)}h`,
      color: "#a78bfa",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="glass-panel p-4 flex flex-col items-center text-center gap-1">
          <span className="text-lg">{s.icon}</span>
          <span
            className="text-2xl font-extrabold leading-none"
            style={{ color: s.color }}
            data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {s.value}
          </span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
