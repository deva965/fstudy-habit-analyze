import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Moon, Sun, Trash2, Edit2, Check, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/components/theme-provider";
import {
  useListStudyLogs,
  getListStudyLogsQueryKey,
  useGetAnalytics,
  getGetAnalyticsQueryKey,
  useGetGoal,
  getGetGoalQueryKey,
  useCreateStudyLog,
  useDeleteStudyLog,
  useClearAllStudyLogs,
  useUpdateGoal,
} from "@workspace/api-client-react";

// Form schema
const logSchema = z.object({
  date: z.string().min(1, "Date is required"),
  subject: z.string().min(1, "Subject is required"),
  hoursStudied: z.coerce.number().min(0.5, "Must be at least 0.5").max(24),
  focusLevel: z.enum(["excellent", "good", "average", "low", "very_poor"]),
  mood: z.enum(["happy", "normal", "stressed"])
});
type LogFormData = z.infer<typeof logSchema>;

const focusEmojis: Record<string, string> = {
  excellent: "🔥",
  good: "🙂",
  average: "😐",
  low: "😴",
  very_poor: "😫"
};
const moodEmojis: Record<string, string> = {
  happy: "😊",
  normal: "😐",
  stressed: "😖"
};

export default function Home() {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  
  // Queries
  const { data: logs, isLoading: logsLoading } = useListStudyLogs();
  const { data: analytics, isLoading: analyticsLoading } = useGetAnalytics();
  const { data: goal, isLoading: goalLoading } = useGetGoal();

  // Mutations
  const createLog = useCreateStudyLog();
  const deleteLog = useDeleteStudyLog();
  const clearLogs = useClearAllStudyLogs();
  const updateGoal = useUpdateGoal();

  // Form setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LogFormData>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      subject: "",
      hoursStudied: 1,
      focusLevel: "good",
      mood: "normal"
    }
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListStudyLogsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetAnalyticsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetGoalQueryKey() });
  };

  const onSubmit = (data: LogFormData) => {
    createLog.mutate({ data: data as any }, {
      onSuccess: () => {
        invalidateAll();
        reset({ ...data, subject: "", hoursStudied: 1 });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteLog.mutate({ id }, {
      onSuccess: invalidateAll
    });
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all logs?")) {
      clearLogs.mutate(undefined, {
        onSuccess: invalidateAll
      });
    }
  };

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState("");

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(tempGoal);
    if (!isNaN(parsed) && parsed > 0) {
      updateGoal.mutate({ data: { dailyGoalHours: parsed } }, {
        onSuccess: () => {
          invalidateAll();
          setIsEditingGoal(false);
        }
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isLoading = logsLoading || analyticsLoading || goalLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-white/50 text-lg">Loading your study data...</div>
      </div>
    );
  }

  // Derived values safely
  const todayHours = analytics?.todayHours || 0;
  const goalHours = goal?.dailyGoalHours || analytics?.goalHours || 2;
  const progressPercent = Math.min(100, (todayHours / goalHours) * 100) || 0;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8 pb-24 space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Header */}
      <header className="flex items-center justify-between py-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">🧠 Study Habit Analyzer</h1>
        <Button 
          variant="default" 
          className="rounded-full px-5 sm:px-6 shadow-xl shadow-cyan-500/20"
          onClick={toggleTheme}
          data-testid="button-toggle-theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 sm:mr-2" /> : <Moon className="w-4 h-4 sm:mr-2" />}
          <span className="hidden sm:inline">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </Button>
      </header>

      {/* 1. Daily Study Log Card */}
      <section className="glass-panel p-6 sm:p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          📘 Daily Study Log
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Input type="date" {...register("date")} data-testid="input-date" />
              {errors.date && <p className="text-red-400 text-sm font-medium">{errors.date.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Input type="text" placeholder="Subject" {...register("subject")} data-testid="input-subject" />
              {errors.subject && <p className="text-red-400 text-sm font-medium">{errors.subject.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Input type="number" step="0.5" placeholder="Hours Studied" {...register("hoursStudied")} data-testid="input-hours" />
              {errors.hoursStudied && <p className="text-red-400 text-sm font-medium">{errors.hoursStudied.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Select {...register("focusLevel")} className="bg-[#2d245e] dark:bg-[#1a153a]" data-testid="select-focus">
                <option value="excellent">🔥 Excellent Focus</option>
                <option value="good">🙂 Good</option>
                <option value="average">😐 Average</option>
                <option value="low">😴 Low</option>
                <option value="very_poor">😫 Very Poor</option>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Select {...register("mood")} className="bg-[#2d245e] dark:bg-[#1a153a]" data-testid="select-mood">
                <option value="happy">😊 Happy</option>
                <option value="normal">😐 Normal</option>
                <option value="stressed">😖 Stressed</option>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full text-lg h-14 mt-4 font-bold shadow-xl shadow-cyan-500/20" disabled={createLog.isPending} data-testid="button-add-entry">
            {createLog.isPending ? "Adding Entry..." : "Add Entry"}
          </Button>
        </form>
      </section>

      {/* 2. Stats row */}
      <section className="grid grid-cols-3 gap-4">
        <div className="glass-panel p-5 flex flex-col items-center justify-center text-center">
          <div className="text-sm font-medium text-white/70 mb-2">📊 Productivity</div>
          <div className="text-3xl font-extrabold text-primary drop-shadow-md" data-testid="text-productivity">{Math.round(analytics?.productivityScore ?? 0)}/100</div>
        </div>
        <div className="glass-panel p-5 flex flex-col items-center justify-center text-center">
          <div className="text-sm font-medium text-white/70 mb-2">🔥 Streak</div>
          <div className="text-3xl font-extrabold text-orange-400 drop-shadow-md" data-testid="text-streak">{analytics?.streakDays ?? 0} days</div>
        </div>
        <div className="glass-panel p-5 flex flex-col items-center justify-center text-center">
          <div className="text-sm font-medium text-white/70 mb-2">🎯 Goal</div>
          <div className="text-3xl font-extrabold drop-shadow-md" data-testid="text-goal-met">
            {analytics?.dailyGoalMet ? "✅" : "❌"}
          </div>
        </div>
      </section>

      {/* 3. Daily Goal */}
      <section className="glass-panel p-6 sm:p-8">
        <div className="flex justify-between items-center mb-5">
          {isEditingGoal ? (
            <form onSubmit={handleGoalSubmit} className="flex items-center gap-3">
              <Input 
                type="number" 
                step="0.5" 
                className="w-24 h-10 text-base font-bold" 
                value={tempGoal} 
                onChange={e => setTempGoal(e.target.value)} 
                autoFocus 
                data-testid="input-edit-goal"
              />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0" data-testid="button-save-goal">
                <Check className="w-5 h-5" />
              </Button>
            </form>
          ) : (
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => { setTempGoal(goalHours.toString()); setIsEditingGoal(true); }}
              data-testid="text-daily-goal"
            >
              <h2 className="text-xl font-semibold">Daily Goal: <span className="font-extrabold text-primary drop-shadow-sm">{goalHours} hrs</span></h2>
              <Edit2 className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
            </div>
          )}
          <div className="text-base font-bold text-white/80">{todayHours} / {goalHours} hrs</div>
        </div>
        <Progress value={progressPercent} className="h-4" data-testid="progress-goal" />
      </section>

      {/* 4. Insights */}
      <section className="glass-panel p-6 sm:p-8">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2">🧠 Insights</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5" data-testid="text-weak-subject">
            <span className="text-white/60 font-medium">Weak Subject:</span> 
            <span className="font-bold text-red-300 text-lg">{analytics?.weakSubject || "-"}</span>
          </div>
          <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/5" data-testid="text-consistency">
            <span className="text-xl">✅</span>
            <span className="text-white/90 font-medium leading-relaxed">{analytics?.consistencyMessage || "Keep logging your studies!"}</span>
          </div>
        </div>
      </section>

      {/* 5. Analytics Chart */}
      <section className="glass-panel p-6 sm:p-8">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2">📈 Analytics</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics?.dailyHours || []} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.4)" 
                tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500}} 
                tickMargin={12}
                tickFormatter={(val) => {
                  try {
                    return format(new Date(val), "MMM d");
                  } catch {
                    return val;
                  }
                }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.4)" 
                tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500}} 
                tickMargin={12}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(20,15,45,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#00d4ff', fontWeight: 'bold' }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}
                labelFormatter={(val) => {
                  try {
                    return format(new Date(val), "MMMM d, yyyy");
                  } catch {
                    return val;
                  }
                }}
              />
              <Line 
                type="monotone" 
                dataKey="hours" 
                name="Hours"
                stroke="var(--color-primary)" 
                strokeWidth={4} 
                dot={{ r: 5, fill: "var(--color-background)", stroke: "var(--color-primary)", strokeWidth: 2 }} 
                activeDot={{ r: 8, fill: "#fff", stroke: "var(--color-primary)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 6. Recent Logs */}
      <section className="glass-panel p-6 sm:p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">📅 Recent Logs</h2>
        {(!logs || logs.length === 0) ? (
          <div className="text-center py-12 text-white/50 bg-white/5 rounded-xl border border-white/5">No logs yet. Start studying!</div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group" data-testid={`row-log-${log.id}`}>
                <div>
                  <div className="font-bold text-lg flex items-center gap-3">
                    {log.subject} 
                    <span className="text-xs text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">{log.hoursStudied} hrs</span>
                  </div>
                  <div className="text-sm font-medium text-white/60 flex items-center gap-3 mt-2">
                    <span>{log.date}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span title={log.focusLevel}>{focusEmojis[log.focusLevel] || "😐"} Focus</span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span title={log.mood}>{moodEmojis[log.mood] || "😐"} Mood</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(log.id)}
                  className="text-white/30 hover:text-red-400 hover:bg-red-400/20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shrink-0"
                  data-testid={`button-delete-${log.id}`}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 7. Footer Actions */}
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="flex-1 h-14 text-base sm:text-lg font-bold bg-white/5 hover:bg-white/10 shadow-lg border-white/10" 
          onClick={() => window.print()}
          data-testid="button-export"
        >
          <Printer className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Export PDF</span>
          <span className="sm:hidden">Export</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 h-14 text-base sm:text-lg font-bold text-red-300 border-red-500/30 bg-red-500/5 hover:bg-red-500/20 hover:text-red-100 shadow-lg" 
          onClick={handleClearAll}
          data-testid="button-clear-all"
        >
          <Trash2 className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Clear All</span>
          <span className="sm:hidden">Clear</span>
        </Button>
      </div>
    </div>
  );
}