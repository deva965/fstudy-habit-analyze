import { Moon, Sun } from "lucide-react";

interface Props {
  dark: boolean;
  onToggle: () => void;
}

export function Header({ dark, onToggle }: Props) {
  return (
    <header className="flex items-center justify-between py-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          🧠 Study Habit Analyzer
        </h1>
        <p className="text-white/40 text-sm mt-0.5 hidden sm:block">
          Track · Analyze · Improve
        </p>
      </div>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all"
        style={{
          background: "linear-gradient(135deg, #00d4ff, #0099cc)",
          color: "#0a0a1a",
          boxShadow: "0 4px 20px rgba(0,212,255,0.3)",
        }}
        aria-label="Toggle theme"
      >
        {dark ? <Sun size={15} /> : <Moon size={15} />}
        <span className="hidden sm:inline">{dark ? "Light Mode" : "Dark Mode"}</span>
      </button>
    </header>
  );
}
