import { Router, Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/errorHandler.js";
import { ValidationError } from "../middleware/errors.js";
import { geminiVisionService } from "../services/geminiVisionService.js";

const router = Router();

const analyzeSchema = z.object({
  photoBase64: z.string().min(1, "photoBase64 is required"),
  context: z.enum(["PROBLEM_SOLVING", "5S"]),
  contextDescription: z.string().optional(),
});

router.post(
  "/ai/vision/analyze",
  asyncHandler(async (req: Request, res: Response) => {
    const payload = analyzeSchema.parse(req.body);

    if (!req.user) {
      throw new ValidationError("Unauthorized");
    }

    const analysis = await geminiVisionService.analyzePhoto(
      payload.photoBase64,
      payload.context,
      payload.contextDescription
    );

    res.json({
      analysis,
      message: "Vision analysis completed",
    });
  })
);

export default router;
