import { Router, Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validateBody, validateParams } from "../middleware/validation.js";
import {
  ensureUser,
  getAreaDetail,
  getAreasForUser,
  getBadgeProgress,
  getDailyChallenge,
  getLeaderboardSummary,
  getNpcDialogWithProblem,
  getProblemById,
  getQuestById,
  getQuestStatus,
  startQuest,
  submitQuestAnswer,
  summarizeQuestProgress,
  listIdeasForUser,
  submitIdea,
} from "../services/gembaService.js";
import { ValidationError } from "../middleware/errors.js";
import { progressionService } from "../services/progressionService.js";
import { achievementService } from "../services/achievementService.js";
import { badgeService } from "../services/badgeService.js";
import { leaderboardStatsService } from "../services/leaderboardStatsService.js";
import prisma from "../lib/prisma.js";
import { GameCompletionResponse } from "../types/gamification.js";

const router = Router();

const questSubmissionSchema = z.object({
  why1: z.string().min(2),
  why2: z.string().min(2),
  why3: z.string().min(2),
  why4: z.string().min(2),
  why5: z.string().min(2),
  rootCause: z.string().min(2),
  solutionId: z.number(),
});

const ideaSubmissionSchema = z.object({
  title: z.string().min(3),
  problemContext: z.string().min(10),
  proposedSolution: z.string().min(10),
  impact: z.string().min(5),
});

router.get(
  "/areas",
  asyncHandler(async (req: Request, res: Response) => {
    const user = await ensureUser(req.user);
    const areas = getAreasForUser(user);
    res.json({ areas });
  })
);

router.get(
  "/areas/:areaId",
  validateParams(z.object({ areaId: z.coerce.number().int().positive() })),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await ensureUser(req.user);
    const { areaId } = req.validated!.params as { areaId: number };
    const area = getAreaDetail(areaId, user);
    res.json(area);
  })
);

router.get(
  "/npcs/:npcId",
  validateParams(z.object({ npcId: z.coerce.number().int().positive() })),
  asyncHandler(async (req: Request, res: Response) => {
    const { npcId } = req.validated!.params as { npcId: number };
    const npc = getNpcDialogWithProblem(npcId);
    res.json(npc);
  })
);

router.get(
  "/problems/:problemId",
  validateParams(z.object({ problemId: z.coerce.number().int().positive() })),
  asyncHandler(async (req: Request, res: Response) => {
    const { problemId } = req.validated!.params as { problemId: number };
    const problem = getProblemById(problemId);
    res.json(problem);
  })
);

router.get(
  "/quests/:questId",
  validateParams(z.object({ questId: z.coerce.number().int().positive() })),
  asyncHandler(async (req: Request, res: Response) => {
    const { questId } = req.validated!.params as { questId: number };
    const quest = getQuestById(questId);
    res.json(quest);
  })
);

router.post(
  "/quests/:questId/start",
  validateParams(z.object({ questId: z.coerce.number().int().positive() })),
  asyncHandler(async (req: Request, res: Response) => {
    const { questId } = req.validated!.params as { questId: number };
    const user = await ensureUser(req.user);
    const state = startQuest(questId, user);
    res.status(201).json({ state });
  })
);

router.post(
  "/quests/:questId/submit",
  validateParams(z.object({ questId: z.coerce.number().int().positive() })),
  validateBody(questSubmissionSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { questId } = req.validated!.params as { questId: number };
    const user = await ensureUser(req.user);
    const data = req.validated!.body as z.infer<typeof questSubmissionSchema>;

    const result = submitQuestAnswer(questId, user, data);
    const xpEarned = result.evaluation.xpReward ?? 0;

    if (xpEarned > 0) {
      await progressionService.addXp(user.id, xpEarned);
    }

    const completedWalks = await prisma.userQuest.count({
      where: { userId: user.id, status: "completed" },
    });
    const achieved = await achievementService.updateAchievementProgress(
      user.id,
      "gemba_observations",
      completedWalks,
    );

    const badges = await badgeService.checkAndUnlockBadges(user.id);
    await leaderboardStatsService.updateStats(user.id);

    const response: GameCompletionResponse<typeof result> = {
      ...result,
      xpEarned,
      achievementsProgressed: achieved.length,
      badgesUnlocked: badges.length,
      badges,
    };

    res.json(response);
  })
);

router.get(
  "/quests/:questId/status",
  validateParams(z.object({ questId: z.coerce.number().int().positive() })),
  asyncHandler(async (req: Request, res: Response) => {
    const { questId } = req.validated!.params as { questId: number };
    const user = await ensureUser(req.user);
    const state = getQuestStatus(questId, user.id);
    res.json(state);
  })
);

router.get(
  "/progress",
  asyncHandler(async (req: Request, res: Response) => {
    const user = await ensureUser(req.user);
    const progress = summarizeQuestProgress(user.id);
    res.json({ progress });
  })
);

router.get(
  "/leaderboard",
  asyncHandler(async (_req: Request, res: Response) => {
    const leaderboard = getLeaderboardSummary();
    res.json(leaderboard);
  })
);

router.get(
  "/daily-challenge",
  asyncHandler(async (_req: Request, res: Response) => {
    const challenge = getDailyChallenge();
    res.json(challenge);
  })
);

router.get(
  "/badges",
  asyncHandler(async (req: Request, res: Response) => {
    const user = await ensureUser(req.user);
    const badges = getBadgeProgress(user.id);
    res.json(badges);
  })
);

router.get(
  "/ideas",
  asyncHandler(async (req: Request, res: Response) => {
    const user = await ensureUser(req.user);
    const ideas = listIdeasForUser(user.id);
    res.json({ ideas });
  })
);

router.post(
  "/ideas",
  validateBody(ideaSubmissionSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await ensureUser(req.user);
    const data = req.validated!.body as z.infer<typeof ideaSubmissionSchema>;

    const idea = submitIdea(user.id, data);
    res.status(201).json({ idea });
  })
);

export default router;