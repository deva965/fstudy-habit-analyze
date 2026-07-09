import { useAnalytics } from "../hooks";

export function Insights() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <section className="glass p-6 sm:p-8">
        <h2 className="section-title">🧠 Insights</h2>
        <div className="space-y-3">
          <div className="h-12 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-12 rounded-xl bg-white/5 animate-pulse" />
        </div>
      </section>
    );
  }

  const weak = analytics?.weakSubject;
  const msg = analytics?.consistencyMessage ?? "Keep logging your studies!";

  return (
    <section className="glass p-6 sm:p-8">
      <h2 className="section-title">🧠 Insights</h2>
      <div className="space-y-3">
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span className="text-xl flex-shrink-0">📚</span>
          <div>
            <div className="text-xs text-white/40 uppercase tracking-wide font-semibold mb-0.5">
              Needs Most Attention
            </div>
            <div className="font-bold text-base">
              {weak ? (
                <span style={{ color: "#f87171" }}>{weak}</span>
              ) : (
                <span className="text-white/50">No weak subject yet</span>
              )}
            </div>
          </div>
        </div>

        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span className="text-xl flex-shrink-0 mt-0.5">✅</span>
          <div>
            <div className="text-xs text-white/40 uppercase tracking-wide font-semibold mb-0.5">
              Consistency
            </div>
            <div className="text-white/90 font-medium leading-relaxed">
              {msg}
            </div>
          </div>
        </div>

        {analytics && analytics.streakDays >= 3 && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{
              background: "rgba(251,146,60,0.08)",
              border: "1px solid rgba(251,146,60,0.2)",
            }}
          >
            <span className="text-xl flex-shrink-0">🔥</span>
            <div className="font-semibold text-orange-300">
              {analytics.streakDays}-day streak! Keep it going!
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
