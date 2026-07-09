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
        className="flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl border transition-all"
        style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
        data-testid="button-export"
      >
        <Printer size={15} />
        <span className="hidden sm:inline">Export PDF</span>
        <span className="sm:hidden">Export</span>
      </button>

      <button
        onClick={handleClear}
        disabled={clearLogs.isPending}
        className="flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl border transition-all disabled:opacity-50"
        style={{
          background: "hsl(var(--destructive) / 0.07)",
          borderColor: "hsl(var(--destructive) / 0.25)",
          color: "hsl(var(--destructive))",
        }}
        data-testid="button-clear-all"
      >
        <Trash2 size={15} />
        <span className="hidden sm:inline">{clearLogs.isPending ? "Clearing…" : "Clear All"}</span>
        <span className="sm:hidden">Clear</span>
      </button>
    </div>
  );
}
