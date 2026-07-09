import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { StudyLogForm } from "./components/StudyLogForm";
import { StatsRow } from "./components/StatsRow";
import { DailyGoal } from "./components/DailyGoal";
import { Insights } from "./components/Insights";
import { AnalyticsChart } from "./components/AnalyticsChart";
import { RecentLogs } from "./components/RecentLogs";
import { FooterActions } from "./components/FooterActions";

export default function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("sha-theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("sha-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">

        {/* Header */}
        <header className="flex items-center justify-between py-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              🧠 Study Habit Analyzer
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5 hidden sm:block">
              Track · Analyze · Improve
            </p>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all no-print"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.75))",
              color: "hsl(var(--primary-foreground))",
              boxShadow: "0 4px 20px hsl(var(--primary) / 0.3)",
            }}
            aria-label="Toggle theme"
            data-testid="button-toggle-theme"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
            <span className="hidden sm:inline">{dark ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </header>

        {/* Main content */}
        <main className="space-y-4">
          <StudyLogForm />
          <StatsRow />
          <DailyGoal />
          <Insights />
          <AnalyticsChart />
          <RecentLogs />
          <FooterActions />
        </main>

        <footer className="mt-10 text-center text-muted-foreground text-xs no-print">
          Study Habit Analyzer · Connected to Render API
        </footer>
      </div>
    </div>
  );
}
