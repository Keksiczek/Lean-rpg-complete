import { Router } from "express";
import prisma from "../lib/prisma.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { tenantContext } from "../middleware/tenantContext.js";
import { requireTenantContext } from "../middleware/dataIsolation.js";
import type { ApiSuccessResponse } from "../types/response.js";

const router = Router();

router.get(
  "/areas",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({ success: false, error: "Tenant context missing" });
    }

    const areas = await prisma.factoryArea.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    });

    const response: ApiSuccessResponse<typeof areas> = { success: true, data: areas };
    return res.json(response);
  })
);

router.get(
  "/areas/:id",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({ success: false, error: "Tenant context missing" });
    }

    const area = await prisma.factoryArea.findFirst({
      where: { id: req.params.id, tenantId },
      include: { locations: true },
    });

    if (!area) {
      return res.status(404).json({ success: false, error: "Factory area not found" });
    }

    const response: ApiSuccessResponse<typeof area> = { success: true, data: area };
    return res.json(response);
  })
);

router.get(
  "/locations/:id",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({ success: false, error: "Tenant context missing" });
    }

    const location = await prisma.factoryLocation.findFirst({
      where: { id: req.params.id, area: { tenantId } },
      include: { area: true },
    });

    if (!location) {
      return res.status(404).json({ success: false, error: "Factory location not found" });
    }

    const response: ApiSuccessResponse<typeof location> = { success: true, data: location };
    return res.json(response);
  })
);

router.get(
  "/scan/:qrCode",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({ success: false, error: "Tenant context missing" });
    }

    const location = await prisma.factoryLocation.findFirst({
      where: { qrCode: req.params.qrCode, area: { tenantId } },
      include: { area: true },
    });

    if (!location) {
      return res.status(404).json({ success: false, error: "Location not found" });
    }

    const response: ApiSuccessResponse<typeof location> = { success: true, data: location };
    return res.json(response);
  })
);

export default router;
