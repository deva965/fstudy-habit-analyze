import { useAnalytics } from "../hooks";

export function Insights() {
  const { data: analytics, isLoading } = useAnalytics();

  return (
    <section className="glass-panel p-6 sm:p-8">
      <h2 className="text-lg font-bold mb-5 flex items-center gap-2">🧠 Insights</h2>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            data-testid="text-weak-subject"
          >
            <span className="text-xl flex-shrink-0">📚</span>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">
                Needs Most Attention
              </div>
              <div className="font-bold">
                {analytics?.weakSubject ? (
                  <span className="text-destructive">{analytics.weakSubject}</span>
                ) : (
                  <span className="text-muted-foreground">No data yet</span>
                )}
              </div>
            </div>
          </div>

          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            data-testid="text-consistency"
          >
            <span className="text-xl flex-shrink-0 mt-0.5">✅</span>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">
                Consistency
              </div>
              <p className="text-sm leading-relaxed">
                {analytics?.consistencyMessage ?? "Keep logging your sessions!"}
              </p>
            </div>
          </div>

          {(analytics?.streakDays ?? 0) >= 3 && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)" }}
            >
              <span className="text-xl">🔥</span>
              <span className="font-semibold text-sm" style={{ color: "#fb923c" }}>
                {analytics!.streakDays}-day streak — keep it going!
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
