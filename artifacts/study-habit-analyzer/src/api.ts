const BASE = "https://fstudy-habit-analyze.onrender.com/api";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (res.status === 204) return null as T;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string; message?: string }).error ??
        (body as { message?: string }).message ??
        `HTTP ${res.status}`
    );
  }
  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────────────

export type FocusLevel = "excellent" | "good" | "average" | "low" | "very_poor";
export type Mood = "happy" | "normal" | "stressed";

export interface StudyLog {
  id: number;
  date: string;
  subject: string;
  hoursStudied: number;
  focusLevel: FocusLevel;
  mood: Mood;
  createdAt: string;
}

export interface SubjectBreakdown {
  subject: string;
  totalHours: number;
  sessionCount: number;
}

export interface DailyHours {
  date: string;
  hours: number;
}

export interface Analytics {
  productivityScore: number;
  streakDays: number;
  dailyGoalMet: boolean;
  todayHours: number;
  goalHours: number;
  weeklyHours: number;
  weakSubject: string | null;
  consistencyMessage: string;
  subjectBreakdown: SubjectBreakdown[];
  dailyHours: DailyHours[];
}

export interface Goal {
  id: number;
  dailyGoalHours: number;
  updatedAt: string;
}

export interface CreateLogInput {
  date: string;
  subject: string;
  hoursStudied: number;
  focusLevel: FocusLevel;
  mood: Mood;
}

// ── API ────────────────────────────────────────────────────────────────────────

export const api = {
  getLogs: () => req<StudyLog[]>("/study-logs"),
  createLog: (data: CreateLogInput) =>
    req<StudyLog>("/study-logs", { method: "POST", body: JSON.stringify(data) }),
  deleteLog: (id: number) =>
    req<null>(`/study-logs/${id}`, { method: "DELETE" }),
  clearLogs: () => req<null>("/study-logs", { method: "DELETE" }),
  getAnalytics: () => req<Analytics>("/analytics"),
  getGoal: () => req<Goal>("/goals"),
  updateGoal: (dailyGoalHours: number) =>
    req<Goal>("/goals", {
      method: "PUT",
      body: JSON.stringify({ dailyGoalHours }),
    }),
};
