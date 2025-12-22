import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { tenantContext } from "../middleware/tenantContext.js";
import { requireTenantContext } from "../middleware/dataIsolation.js";
import { verifyToken, adminCheck } from "../middleware/auth.js";
import type { ApiSuccessResponse } from "../types/response.js";

const router = Router();

const tenantSettingsSchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().nullable().optional(),
  colors: z.record(z.string(), z.any()).optional(),
  featureFlags: z.array(z.string()).optional(),
  settings: z.record(z.string(), z.any()).optional(),
  logoUrl: z.string().nullable().optional(),
  primaryColor: z.string().nullable().optional(),
  secondaryColor: z.string().nullable().optional(),
  language: z.string().optional(),
  locale: z.string().optional(),
  defaultTheme: z.string().optional(),
});

router.get(
  "/",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({
        success: false,
        error: "Tenant context missing",
      });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: "Tenant not found",
      });
    }

    const response: ApiSuccessResponse<typeof tenant> = { success: true, data: tenant };
    return res.json(response);
  })
);

router.get(
  "/by-slug/:slug",
  asyncHandler(async (req, res) => {
    const slug = req.params.slug;
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: "Tenant not found",
      });
    }

    const response: ApiSuccessResponse<typeof tenant> = { success: true, data: tenant };
    return res.json(response);
  })
);

router.put(
  "/settings",
  verifyToken,
  adminCheck,
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const parsed = tenantSettingsSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid settings payload",
      });
    }

    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({
        success: false,
        error: "Tenant context missing",
      });
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: parsed.data,
    });

    const response: ApiSuccessResponse<typeof tenant> = { success: true, data: tenant };
    return res.json(response);
  })
);

export default router;
