import { Router } from "express";
import axios from "axios";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import prisma from "../lib/prisma.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { verifyToken } from "../middleware/auth.js";
import { config } from "../config.js";
import type { ApiSuccessResponse } from "../types/response.js";

const router = Router();

const chatSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
});

const SYSTEM_PROMPT =
  "You are Lean Sensei, a friendly tutor for Lean manufacturing. Explain Lean concepts clearly, use examples from automotive production, and keep answers concise and helpful.";

async function callGeminiChat({ prompt }: { prompt: string }) {
  if (!config.gemini.apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.gemini.apiKey}`,
    {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    },
    { timeout: config.gemini.timeoutMs }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini response missing content");
  }

  return text;
}

router.post(
  "/",
  verifyToken,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const parsed = chatSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: "Invalid payload" });
    }

    const sessionId = parsed.data.sessionId ?? uuidv4();

    await prisma.chatMessage.create({
      data: {
        sessionId,
        userId: req.user.userId,
        role: "user",
        content: parsed.data.message,
      },
    });

    const prompt = `${SYSTEM_PROMPT}\n\nUser: ${parsed.data.message}`;
    const reply = await callGeminiChat({ prompt });

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        userId: req.user.userId,
        role: "assistant",
        content: reply,
      },
    });

    const payload = {
      sessionId,
      message: assistantMessage,
    };

    const response: ApiSuccessResponse<typeof payload> = { success: true, data: payload };
    return res.status(201).json(response);
  })
);

router.get(
  "/history",
  verifyToken,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const sessionId = typeof req.query.sessionId === "string" ? req.query.sessionId : null;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: "sessionId is required" });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { userId: req.user.userId, sessionId },
      orderBy: { createdAt: "asc" },
    });

    const response: ApiSuccessResponse<typeof messages> = { success: true, data: messages };
    return res.json(response);
  })
);

router.get(
  "/sessions",
  verifyToken,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const sessions = await prisma.chatMessage.findMany({
      where: { userId: req.user.userId },
      distinct: ["sessionId"],
      orderBy: { createdAt: "desc" },
      select: {
        sessionId: true,
        createdAt: true,
      },
    });

    const response: ApiSuccessResponse<typeof sessions> = { success: true, data: sessions };
    return res.json(response);
  })
);

export default router;
