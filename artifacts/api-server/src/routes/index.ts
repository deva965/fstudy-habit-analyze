import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studyLogsRouter from "./study-logs";
import analyticsRouter from "./analytics";
import goalsRouter from "./goals";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studyLogsRouter);
router.use(analyticsRouter);
router.use(goalsRouter);

export default router;
