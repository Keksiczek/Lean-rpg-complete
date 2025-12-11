import { NextFunction, Request, Response } from "express";
import { z } from "zod";

function formatValidationError(error: z.ZodError) {
  return {
    error: "Validation failed",
    details: error.flatten(),
  };
}

export const validateBody = (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(formatValidationError(parsed.error));
    }
    req.validatedBody = parsed.data;
    return next();
  };

export const validateParams = (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json(formatValidationError(parsed.error));
    }
    req.validatedParams = parsed.data;
    return next();
  };

export const validateQuery = (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json(formatValidationError(parsed.error));
    }
    req.validatedQuery = parsed.data;
    return next();
  };
