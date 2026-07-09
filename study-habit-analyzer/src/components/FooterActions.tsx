import { Printer, Trash2 } from "lucide-react";
import { useClearLogs } from "../hooks";

export function FooterActions() {
  const clearLogs = useClearLogs();

  const handleClear = () => {
    if (window.confirm("Delete ALL study logs? This cannot be undone.")) {
      clearLogs.mutate();
    }
  };

  return (
    <div className="flex gap-3 no-print">
      <button
        onClick={() => window.print()}
        className="btn-ghost flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-semibold"
      >
        <Printer size={16} />
        <span className="hidden sm:inline">Export PDF</span>
        <span className="sm:hidden">Export</span>
      </button>

      <button
        onClick={handleClear}
        disabled={clearLogs.isPending}
        className="flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl transition-all border"
        style={{
          background: "rgba(239,68,68,0.07)",
          borderColor: "rgba(239,68,68,0.25)",
          color: "#fca5a5",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(239,68,68,0.18)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(239,68,68,0.07)";
        }}
      >
        <Trash2 size={16} />
        <span className="hidden sm:inline">
          {clearLogs.isPending ? "Clearing…" : "Clear All"}
        </span>
        <span className="sm:hidden">Clear</span>
      </button>
    </div>
  );
}
