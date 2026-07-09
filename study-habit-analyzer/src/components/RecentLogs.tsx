import { Trash2 } from "lucide-react";
import { useStudyLogs, useDeleteLog } from "../hooks";
import type { FocusLevel, Mood } from "../api";

const FOCUS_EMOJI: Record<FocusLevel, string> = {
  excellent: "🔥",
  good: "🙂",
  average: "😐",
  low: "😴",
  very_poor: "😫",
};

const MOOD_EMOJI: Record<Mood, string> = {
  happy: "😊",
  normal: "😐",
  stressed: "😖",
};

const FOCUS_LABEL: Record<FocusLevel, string> = {
  excellent: "Excellent",
  good: "Good",
  average: "Average",
  low: "Low",
  very_poor: "Very Poor",
};

export function RecentLogs() {
  const { data: logs, isLoading } = useStudyLogs();
  const deleteLog = useDeleteLog();

  return (
    <section className="glass p-6 sm:p-8">
      <h2 className="section-title">📅 Recent Logs</h2>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {!isLoading && (!logs || logs.length === 0) && (
        <div className="text-center py-12 text-white/30">
          <div className="text-4xl mb-3">📖</div>
          <div className="font-medium">No logs yet.</div>
          <div className="text-sm mt-1">Add your first study session above!</div>
        </div>
      )}

      {!isLoading && logs && logs.length > 0 && (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="log-row">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold truncate">{log.subject}</span>
                  <span className="badge">{log.hoursStudied} hrs</span>
                </div>
                <div className="text-xs text-white/45 mt-1 flex items-center gap-2 flex-wrap">
                  <span>{log.date}</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-white/20 inline-block" />
                  <span title={`Focus: ${FOCUS_LABEL[log.focusLevel]}`}>
                    {FOCUS_EMOJI[log.focusLevel]} {FOCUS_LABEL[log.focusLevel]}
                  </span>
                  <span className="w-0.5 h-0.5 rounded-full bg-white/20 inline-block" />
                  <span>{MOOD_EMOJI[log.mood]}</span>
                </div>
              </div>
              <button
                className="delete-btn ml-3"
                onClick={() => deleteLog.mutate(log.id)}
                disabled={deleteLog.isPending}
                aria-label={`Delete log for ${log.subject}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
