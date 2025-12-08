import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { userQuestId, workstationId, textInput, imageUrl } = req.body as {
    userQuestId?: number;
    workstationId?: number;
    textInput?: string;
    imageUrl?: string;
  };

  if (!userQuestId || !workstationId) {
    return res.status(400).json({ message: "userQuestId and workstationId are required" });
  }

  const userQuest = await prisma.userQuest.findUnique({ where: { id: userQuestId } });
  if (!userQuest || userQuest.userId !== req.user.id) {
    return res.status(403).json({ message: "Not allowed to submit for this quest" });
  }

  const submission = await prisma.submission.create({
    data: {
      userQuestId,
      workstationId,
      textInput,
      imageUrl,
      // TODO: Integrate Google Gemini for AI feedback and scoring once available.
    },
  });

  await prisma.userQuest.update({
    where: { id: userQuestId },
    data: { status: "submitted" },
  });

  return res.status(201).json(submission);
});

export default router;
