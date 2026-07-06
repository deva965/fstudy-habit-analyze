import { pgTable, serial, text, real, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studyLogsTable = pgTable("study_logs", {
  id: serial("id").primaryKey(),
  date: date("date", { mode: "string" }).notNull(),
  subject: text("subject").notNull(),
  hoursStudied: real("hours_studied").notNull(),
  focusLevel: text("focus_level").notNull(), // excellent | good | average | low | very_poor
  mood: text("mood").notNull(), // happy | normal | stressed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStudyLogSchema = createInsertSchema(studyLogsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertStudyLog = z.infer<typeof insertStudyLogSchema>;
export type StudyLog = typeof studyLogsTable.$inferSelect;
