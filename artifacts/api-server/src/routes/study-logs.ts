import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, studyLogsTable } from "@workspace/db";
import {
  CreateStudyLogBody,
  DeleteStudyLogParams,
  ListStudyLogsResponse,
  CreateStudyLogResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// GET /study-logs — list all study logs sorted by date desc
router.get("/study-logs", async (req, res): Promise<void> => {
  const logs = await db
    .select()
    .from(studyLogsTable)
    .orderBy(desc(studyLogsTable.date), desc(studyLogsTable.createdAt));
  res.json(ListStudyLogsResponse.parse(logs));
});

// POST /study-logs — create a study log entry
router.post("/study-logs", async (req, res): Promise<void> => {
  const parsed = CreateStudyLogBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid study log body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [log] = await db
    .insert(studyLogsTable)
    .values({
      date: parsed.data.date,
      subject: parsed.data.subject,
      hoursStudied: parsed.data.hoursStudied,
      focusLevel: parsed.data.focusLevel,
      mood: parsed.data.mood,
    })
    .returning();

  res.status(201).json(CreateStudyLogResponse.parse(log));
});

// DELETE /study-logs — clear all study logs
router.delete("/study-logs", async (req, res): Promise<void> => {
  await db.delete(studyLogsTable);
  res.sendStatus(204);
});

// DELETE /study-logs/:id — delete a specific study log
router.delete("/study-logs/:id", async (req, res): Promise<void> => {
  const parsed = DeleteStudyLogParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [deleted] = await db
    .delete(studyLogsTable)
    .where(eq(studyLogsTable.id, parsed.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Study log not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
