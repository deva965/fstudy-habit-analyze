import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { StudyLogForm } from "./components/StudyLogForm";
import { StatsRow } from "./components/StatsRow";
import { DailyGoal } from "./components/DailyGoal";
import { Insights } from "./components/Insights";
import { AnalyticsChart } from "./components/AnalyticsChart";
import { RecentLogs } from "./components/RecentLogs";
import { FooterActions } from "./components/FooterActions";

function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
        <Header dark={dark} onToggle={() => setDark((d) => !d)} />

        <main className="space-y-5">
          <StudyLogForm />
          <StatsRow />
          <DailyGoal />
          <Insights />
          <AnalyticsChart />
          <RecentLogs />
          <FooterActions />
        </main>

        <footer className="mt-12 text-center text-white/20 text-xs">
          Study Habit Analyzer · Built with React + Vite
        </footer>
      </div>
    </div>
  );
}

export default App;
