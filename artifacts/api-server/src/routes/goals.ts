import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, goalsTable } from "@workspace/db";
import { GetGoalResponse, UpdateGoalBody, UpdateGoalResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// Ensure a single goal row exists, creating it if missing
async function getOrCreateGoal() {
  const [existing] = await db.select().from(goalsTable).limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(goalsTable)
    .values({ dailyGoalHours: 5 })
    .returning();
  return created;
}

// GET /goals — get current daily goal
router.get("/goals", async (req, res): Promise<void> => {
  const goal = await getOrCreateGoal();
  res.json(GetGoalResponse.parse(goal));
});

// PUT /goals — update daily goal hours
router.put("/goals", async (req, res): Promise<void> => {
  const parsed = UpdateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid goal body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await getOrCreateGoal();
  const [updated] = await db
    .update(goalsTable)
    .set({ dailyGoalHours: parsed.data.dailyGoalHours, updatedAt: new Date() })
    .where(eq(goalsTable.id, existing.id))
    .returning();

  res.json(UpdateGoalResponse.parse(updated));
});

export default router;
