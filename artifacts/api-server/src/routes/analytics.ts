import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, studyLogsTable, goalsTable } from "@workspace/db";
import { GetAnalyticsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const FOCUS_WEIGHT: Record<string, number> = {
  excellent: 1.0,
  good: 0.8,
  average: 0.6,
  low: 0.4,
  very_poor: 0.2,
};

/**
 * Format a Date as YYYY-MM-DD using the server's local timezone.
 * Stored log dates are plain calendar strings (no time component), so we must
 * match them with local-calendar dates rather than UTC to avoid off-by-one
 * errors near midnight for users in non-UTC timezones.
 */
function toLocalDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Return a new Date shifted by `days` calendar days from `from`. */
function shiftDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

// GET /analytics — compute productivity, streak, goal status, insights, chart data
router.get("/analytics", async (req, res): Promise<void> => {
  const [logs, goalRows] = await Promise.all([
    db
      .select()
      .from(studyLogsTable)
      .orderBy(desc(studyLogsTable.date), desc(studyLogsTable.createdAt)),
    db.select().from(goalsTable).limit(1),
  ]);

  const goalHours = goalRows[0]?.dailyGoalHours ?? 5;

  const now = new Date();

  // Today string (local calendar date)
  const today = toLocalDateStr(now);

  // Hours today
  const todayLogs = logs.filter((l) => l.date === today);
  const todayHours = todayLogs.reduce((sum, l) => sum + l.hoursStudied, 0);

  // Daily goal met
  const dailyGoalMet = todayHours >= goalHours;

  // ---- Productivity score (0-100) ----
  // Based on last 7 days: average(hours * focusWeight) / goalHours * 100, capped at 100
  const sevenDaysAgoStr = toLocalDateStr(shiftDays(now, -6));

  const recentLogs = logs.filter((l) => l.date >= sevenDaysAgoStr);

  let productivityScore = 0;
  if (recentLogs.length > 0) {
    const weightedHours = recentLogs.reduce((sum, l) => {
      const w = FOCUS_WEIGHT[l.focusLevel] ?? 0.6;
      return sum + l.hoursStudied * w;
    }, 0);
    const avgDays = 7;
    const dailyWeightedAvg = weightedHours / avgDays;
    productivityScore = Math.min(100, Math.round((dailyWeightedAvg / goalHours) * 100));
  }

  // ---- Streak ----
  // Walk backwards from today; if today has no logs, skip it and start from yesterday.
  // This lets the streak persist through the current day until midnight.
  const dateSet = new Set(logs.map((l) => l.date));

  let streakDays = 0;
  let cursor = new Date(now);
  for (let i = 0; i < 365; i++) {
    const dayStr = toLocalDateStr(cursor);
    if (dateSet.has(dayStr)) {
      streakDays++;
      cursor = shiftDays(cursor, -1);
    } else if (i === 0) {
      // Today has no logs yet — start checking from yesterday
      cursor = shiftDays(cursor, -1);
    } else {
      break;
    }
  }

  // ---- Weak subject ----
  const subjectMap: Record<string, { totalHours: number; count: number }> = {};
  for (const log of logs) {
    if (!subjectMap[log.subject]) {
      subjectMap[log.subject] = { totalHours: 0, count: 0 };
    }
    subjectMap[log.subject].totalHours += log.hoursStudied;
    subjectMap[log.subject].count++;
  }

  const subjectBreakdown = Object.entries(subjectMap).map(([subject, stats]) => ({
    subject,
    totalHours: Math.round(stats.totalHours * 100) / 100,
    avgHours: Math.round((stats.totalHours / stats.count) * 100) / 100,
    entryCount: stats.count,
  }));

  // Weak subject = lowest average hours (only if > 1 subject)
  let weakSubject: string | null = null;
  if (subjectBreakdown.length > 1) {
    const sorted = [...subjectBreakdown].sort((a, b) => a.avgHours - b.avgHours);
    weakSubject = sorted[0].subject;
  }

  // ---- Consistency message ----
  let consistencyMessage = "Start studying to build your streak!";
  if (streakDays >= 7) {
    consistencyMessage = "🔥 On fire! " + streakDays + "-day streak!";
  } else if (streakDays >= 3) {
    consistencyMessage = "Great consistency!";
  } else if (streakDays >= 1) {
    consistencyMessage = "Good start — keep going!";
  } else if (logs.length > 0) {
    consistencyMessage = "Don't break the chain — study today!";
  }

  // ---- Weekly hours ----
  const weeklyHours = Math.round(
    recentLogs.reduce((sum, l) => sum + l.hoursStudied, 0) * 100,
  ) / 100;

  // ---- Daily hours for chart (last 30 days) ----
  const thirtyDaysAgoStr = toLocalDateStr(shiftDays(now, -29));

  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    dailyMap[toLocalDateStr(shiftDays(now, -(29 - i)))] = 0;
  }
  for (const log of logs.filter((l) => l.date >= thirtyDaysAgoStr)) {
    dailyMap[log.date] = (dailyMap[log.date] ?? 0) + log.hoursStudied;
  }

  const dailyHours = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, hours]) => ({ date, hours: Math.round(hours * 100) / 100 }));

  const responseData = {
    productivityScore,
    streakDays,
    dailyGoalMet,
    todayHours: Math.round(todayHours * 100) / 100,
    goalHours,
    weeklyHours,
    weakSubject,
    consistencyMessage,
    subjectBreakdown,
    dailyHours,
  };

  res.json(GetAnalyticsResponse.parse(responseData));
});

export default router;
