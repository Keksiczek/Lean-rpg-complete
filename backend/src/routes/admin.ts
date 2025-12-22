import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { tenantContext } from "../middleware/tenantContext.js";
import { requireTenantContext } from "../middleware/dataIsolation.js";
import type { ApiSuccessResponse } from "../types/response.js";

const router = Router();

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

const roleSchema = z.object({
  role: z.enum(["user", "moderator", "admin", "superadmin"]),
});

const questCreateSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  leanConcept: z.string().min(1),
  story: z.string().min(1),
  objectives: z.string().min(1),
  difficulty: z.string().min(1),
  xpReward: z.number().int().min(0),
  timeEstimate: z.number().int().min(0),
  skillUnlock: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  areaId: z.number().int().optional().nullable(),
});

const questUpdateSchema = questCreateSchema.partial();

router.get(
  "/stats",
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

    const [userCount, questCount, submissionCount, arScanCount, chatCount] =
      await Promise.all([
        prisma.user.count({ where: { tenantId } }),
        prisma.quest.count({ where: { tenantId } }),
        prisma.submission.count({
          where: { user: { tenantId } },
        }),
        prisma.arScanResult.count({
          where: { user: { tenantId } },
        }),
        prisma.chatMessage.count({
          where: { user: { tenantId } },
        }),
      ]);

    const payload = {
      users: userCount,
      quests: questCount,
      submissions: submissionCount,
      arScans: arScanCount,
      chatMessages: chatCount,
    };

    const response: ApiSuccessResponse<typeof payload> = { success: true, data: payload };
    return res.json(response);
  })
);

router.get(
  "/users",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid pagination",
      });
    }

    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({
        success: false,
        error: "Tenant context missing",
      });
    }

    const { page, pageSize } = parsed.data;
    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          totalXp: true,
          level: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where: { tenantId } }),
    ]);

    const payload = {
      users,
      page,
      pageSize,
      total,
    };

    const response: ApiSuccessResponse<typeof payload> = { success: true, data: payload };
    return res.json(response);
  })
);

router.put(
  "/users/:id/role",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const parsed = roleSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid role payload",
      });
    }

    const userId = Number(req.params.id);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user id",
      });
    }

    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({
        success: false,
        error: "Tenant context missing",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: parsed.data.role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    const response: ApiSuccessResponse<typeof updated> = { success: true, data: updated };
    return res.json(response);
  })
);

router.get(
  "/quests",
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

    const quests = await prisma.quest.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    const response: ApiSuccessResponse<typeof quests> = { success: true, data: quests };
    return res.json(response);
  })
);

router.post(
  "/quests",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const parsed = questCreateSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid quest payload",
      });
    }

    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({
        success: false,
        error: "Tenant context missing",
      });
    }

    const quest = await prisma.quest.create({
      data: {
        ...parsed.data,
        tenantId,
      },
    });

    const response: ApiSuccessResponse<typeof quest> = { success: true, data: quest };
    return res.status(201).json(response);
  })
);

router.get(
  "/quests/:id",
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

    const quest = await prisma.quest.findFirst({
      where: { id: req.params.id, tenantId },
    });

    if (!quest) {
      return res.status(404).json({
        success: false,
        error: "Quest not found",
      });
    }

    const response: ApiSuccessResponse<typeof quest> = { success: true, data: quest };
    return res.json(response);
  })
);

router.put(
  "/quests/:id",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const parsed = questUpdateSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid quest payload",
      });
    }

    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({
        success: false,
        error: "Tenant context missing",
      });
    }

    const quest = await prisma.quest.findFirst({
      where: { id: req.params.id, tenantId },
    });

    if (!quest) {
      return res.status(404).json({
        success: false,
        error: "Quest not found",
      });
    }

    const updated = await prisma.quest.update({
      where: { id: quest.id },
      data: parsed.data,
    });

    const response: ApiSuccessResponse<typeof updated> = { success: true, data: updated };
    return res.json(response);
  })
);

router.delete(
  "/quests/:id",
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

    const quest = await prisma.quest.findFirst({
      where: { id: req.params.id, tenantId },
    });

    if (!quest) {
      return res.status(404).json({
        success: false,
        error: "Quest not found",
      });
    }

    await prisma.quest.delete({ where: { id: quest.id } });

    const response: ApiSuccessResponse<{ deleted: boolean }> = {
      success: true,
      data: { deleted: true },
    };
    return res.json(response);
  })
);

export default router;
