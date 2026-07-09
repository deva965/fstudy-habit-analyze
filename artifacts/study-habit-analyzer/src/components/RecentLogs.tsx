import { Trash2 } from "lucide-react";
import { useStudyLogs, useDeleteLog } from "../hooks";
import type { FocusLevel, Mood } from "../api";

const FOCUS_EMOJI: Record<FocusLevel, string> = {
  excellent: "🔥", good: "🙂", average: "😐", low: "😴", very_poor: "😫",
};
const FOCUS_LABEL: Record<FocusLevel, string> = {
  excellent: "Excellent", good: "Good", average: "Average", low: "Low", very_poor: "Very Poor",
};
const MOOD_EMOJI: Record<Mood, string> = {
  happy: "😊", normal: "😐", stressed: "😖",
};

export function RecentLogs() {
  const { data: logs, isLoading } = useStudyLogs();
  const deleteLog = useDeleteLog();

  return (
    <section className="glass-panel p-6 sm:p-8">
      <h2 className="text-lg font-bold mb-5 flex items-center gap-2">📅 Recent Logs</h2>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      )}

      {!isLoading && (!logs || logs.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-3">📖</div>
          <div className="font-medium">No logs yet</div>
          <div className="text-sm mt-1">Add your first session above!</div>
        </div>
      )}

      {!isLoading && logs && logs.length > 0 && (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="log-row" data-testid={`row-log-${log.id}`}>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold truncate">{log.subject}</span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "hsl(var(--primary) / 0.12)",
                      color: "hsl(var(--primary))",
                      border: "1px solid hsl(var(--primary) / 0.2)",
                    }}
                  >
                    {log.hoursStudied} hrs
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2 flex-wrap">
                  <span>{log.date}</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-current opacity-40 inline-block" />
                  <span title={FOCUS_LABEL[log.focusLevel]}>
                    {FOCUS_EMOJI[log.focusLevel]} {FOCUS_LABEL[log.focusLevel]}
                  </span>
                  <span className="w-0.5 h-0.5 rounded-full bg-current opacity-40 inline-block" />
                  <span>{MOOD_EMOJI[log.mood]}</span>
                </div>
              </div>
              <button
                onClick={() => deleteLog.mutate(log.id)}
                disabled={deleteLog.isPending}
                className="ml-3 p-1.5 rounded-lg text-muted-foreground opacity-40 hover:opacity-100 hover:text-destructive transition-all flex-shrink-0"
                aria-label={`Delete ${log.subject}`}
                data-testid={`button-delete-${log.id}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
