import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

function calculateLevel(totalXp: number): { level: number; nextLevelXp: number } {
  // TODO: Replace with a more sophisticated leveling formula.
  const xpPerLevel = 100;
  const level = Math.max(1, Math.floor(totalXp / xpPerLevel) + 1);
  const nextLevelXp = level * xpPerLevel;
  return { level, nextLevelXp };
}

router.get("/me", async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const levelInfo = calculateLevel(user.totalXp);

  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    totalXp: user.totalXp,
    level: user.level ?? levelInfo.level,
    nextLevelXp: levelInfo.nextLevelXp,
  });
});

export default router;
