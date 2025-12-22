import { Router } from "express";
import multer from "multer";
import axios from "axios";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { verifyToken } from "../middleware/auth.js";
import { config } from "../config.js";
import type { ApiSuccessResponse } from "../types/response.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const analyzeSchema = z.object({
  category: z.enum(["5S_Sort", "5S_SetInOrder", "5S_Shine"]).default("5S_Sort"),
  imageUrl: z.string().optional(),
});

const PROMPTS: Record<string, string> = {
  "5S_Sort": "Analyze for unnecessary items, clutter, or safety hazards. Provide a score 0-100 and list issues.",
  "5S_SetInOrder": "Analyze for proper labeling, designated locations, and organization. Provide a score 0-100 and list issues.",
  "5S_Shine": "Analyze for cleanliness, dust, equipment condition. Provide a score 0-100 and list issues.",
};

async function callGeminiVision({ imageBase64, prompt }: { imageBase64: string; prompt: string }) {
  if (!config.gemini.apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.gemini.apiKey}`,
    {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${prompt} Respond in JSON: { \"score\": number, \"feedback\": string, \"issues\": string[] }.` },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
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
  "/analyze",
  verifyToken,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const parsed = analyzeSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: "Invalid payload" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: "Image file is required" });
    }

    const imageBase64 = file.buffer.toString("base64");
    const prompt = PROMPTS[parsed.data.category];

    let score: number | null = null;
    let feedback = "";
    let issues: string[] = [];

    const geminiText = await callGeminiVision({ imageBase64, prompt });
    try {
      const parsedJson = JSON.parse(geminiText);
      score = typeof parsedJson.score === "number" ? parsedJson.score : null;
      feedback = typeof parsedJson.feedback === "string" ? parsedJson.feedback : geminiText;
      if (Array.isArray(parsedJson.issues)) {
        issues = parsedJson.issues.map((issue: string) => String(issue));
      }
    } catch {
      feedback = geminiText;
    }

    const imageUrl = parsed.data.imageUrl ?? `upload:${file.originalname}`;

    const record = await prisma.arScanResult.create({
      data: {
        userId: req.user.userId,
        imageUrl,
        category: parsed.data.category,
        score,
        feedback,
        issues,
      },
    });

    const payload = {
      result: record,
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

    const results = await prisma.arScanResult.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
    });

    const response: ApiSuccessResponse<typeof results> = { success: true, data: results };
    return res.json(response);
  })
);

export default router;
