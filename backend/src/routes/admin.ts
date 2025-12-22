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

const booleanQuerySchema = z.preprocess((value) => {
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return value;
}, z.boolean().default(false));

const userListQuerySchema = paginationSchema.extend({
  includeInactive: booleanQuerySchema,
});

const userExportQuerySchema = z.object({
  includeInactive: booleanQuerySchema,
});

const roleSchema = z.object({
  role: z.enum(["user", "moderator", "admin", "superadmin"]),
});

const badgeCreateSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  rarity: z.string().min(1),
  xpBonus: z.number().int().min(0),
  iconUrl: z.string().min(1).optional().nullable(),
});

const badgeUpdateSchema = badgeCreateSchema.partial();

const achievementCreateSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  targetValue: z.number().int().min(1),
  trackingType: z.string().min(1),
});

const achievementUpdateSchema = achievementCreateSchema.partial();

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

function parseNumericId(rawId: string) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

function toCsvValue(value: string | number | boolean | null) {
  const stringValue = value === null ? "" : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, "\"\"")}"`;
  }
  return stringValue;
}

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
    const parsed = userListQuerySchema.safeParse(req.query);
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

    const { page, pageSize, includeInactive } = parsed.data;
    const skip = (page - 1) * pageSize;
    const where = {
      tenantId,
      ...(includeInactive ? {} : { isActive: true }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
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

router.get(
  "/users/export",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const parsed = userExportQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid export query",
      });
    }

    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({
        success: false,
        error: "Tenant context missing",
      });
    }

    const where = {
      tenantId,
      ...(parsed.data.includeInactive ? {} : { isActive: true }),
    };

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        totalXp: true,
        level: true,
        isActive: true,
        createdAt: true,
      },
    });

    const header = ["ID", "Email", "Name", "Role", "XP", "Level", "Active", "Created"];
    const rows = users.map((user) => [
      toCsvValue(user.id),
      toCsvValue(user.email),
      toCsvValue(user.name),
      toCsvValue(user.role),
      toCsvValue(user.totalXp),
      toCsvValue(user.level),
      toCsvValue(user.isActive),
      toCsvValue(user.createdAt.toISOString()),
    ]);

    const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=\"users.csv\"");
    return res.status(200).send(csv);
  })
);

router.delete(
  "/users/:id",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const userId = parseNumericId(req.params.id);
    if (!userId) {
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
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    const response: ApiSuccessResponse<typeof updated> = { success: true, data: updated };
    return res.json(response);
  })
);

router.post(
  "/users/:id/reactivate",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const userId = parseNumericId(req.params.id);
    if (!userId) {
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
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    const response: ApiSuccessResponse<typeof updated> = { success: true, data: updated };
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
  "/badges",
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

    const badges = await prisma.badge.findMany({
      orderBy: [{ rarity: "asc" }, { name: "asc" }],
    });

    const response: ApiSuccessResponse<typeof badges> = { success: true, data: badges };
    return res.json(response);
  })
);

router.post(
  "/badges",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const parsed = badgeCreateSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid badge payload",
      });
    }

    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({
        success: false,
        error: "Tenant context missing",
      });
    }

    const badge = await prisma.badge.create({
      data: {
        code: parsed.data.code,
        name: parsed.data.name,
        description: parsed.data.description,
        rarity: parsed.data.rarity,
        xpReward: parsed.data.xpBonus,
        icon: parsed.data.iconUrl ?? null,
        unlockType: "manual",
        unlockCondition: {},
      },
    });

    const response: ApiSuccessResponse<typeof badge> = { success: true, data: badge };
    return res.status(201).json(response);
  })
);

router.put(
  "/badges/:id",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const parsed = badgeUpdateSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid badge payload",
      });
    }

    const badgeId = parseNumericId(req.params.id);
    if (!badgeId) {
      return res.status(400).json({
        success: false,
        error: "Invalid badge id",
      });
    }

    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({
        success: false,
        error: "Tenant context missing",
      });
    }

    const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
    if (!badge) {
      return res.status(404).json({
        success: false,
        error: "Badge not found",
      });
    }

    const { xpBonus, iconUrl, ...rest } = parsed.data;
    const data = {
      ...rest,
      ...(xpBonus !== undefined ? { xpReward: xpBonus } : {}),
      ...(iconUrl !== undefined ? { icon: iconUrl } : {}),
    };

    const updated = await prisma.badge.update({
      where: { id: badge.id },
      data,
    });

    const response: ApiSuccessResponse<typeof updated> = { success: true, data: updated };
    return res.json(response);
  })
);

router.delete(
  "/badges/:id",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const badgeId = parseNumericId(req.params.id);
    if (!badgeId) {
      return res.status(400).json({
        success: false,
        error: "Invalid badge id",
      });
    }

    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({
        success: false,
        error: "Tenant context missing",
      });
    }

    const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
    if (!badge) {
      return res.status(404).json({
        success: false,
        error: "Badge not found",
      });
    }

    const assignedCount = await prisma.userBadge.count({
      where: { badgeId },
    });

    if (assignedCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Badge is assigned to users",
      });
    }

    await prisma.badge.delete({ where: { id: badge.id } });

    const response: ApiSuccessResponse<{ deleted: boolean }> = {
      success: true,
      data: { deleted: true },
    };
    return res.json(response);
  })
);

router.get(
  "/achievements",
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

    const achievements = await prisma.achievement.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    const response: ApiSuccessResponse<typeof achievements> = { success: true, data: achievements };
    return res.json(response);
  })
);

router.post(
  "/achievements",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const parsed = achievementCreateSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid achievement payload",
      });
    }

    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({
        success: false,
        error: "Tenant context missing",
      });
    }

    const achievement = await prisma.achievement.create({
      data: {
        code: parsed.data.code,
        name: parsed.data.name,
        description: parsed.data.description,
        targetValue: parsed.data.targetValue,
        trackingField: parsed.data.trackingType,
        type: parsed.data.trackingType,
      },
    });

    const response: ApiSuccessResponse<typeof achievement> = { success: true, data: achievement };
    return res.status(201).json(response);
  })
);

router.put(
  "/achievements/:id",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const parsed = achievementUpdateSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid achievement payload",
      });
    }

    const achievementId = parseNumericId(req.params.id);
    if (!achievementId) {
      return res.status(400).json({
        success: false,
        error: "Invalid achievement id",
      });
    }

    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({
        success: false,
        error: "Tenant context missing",
      });
    }

    const achievement = await prisma.achievement.findUnique({ where: { id: achievementId } });
    if (!achievement) {
      return res.status(404).json({
        success: false,
        error: "Achievement not found",
      });
    }

    const { trackingType, ...rest } = parsed.data;
    const data = {
      ...rest,
      ...(trackingType !== undefined
        ? { trackingField: trackingType, type: trackingType }
        : {}),
    };

    const updated = await prisma.achievement.update({
      where: { id: achievement.id },
      data,
    });

    const response: ApiSuccessResponse<typeof updated> = { success: true, data: updated };
    return res.json(response);
  })
);

router.delete(
  "/achievements/:id",
  tenantContext,
  requireTenantContext,
  asyncHandler(async (req, res) => {
    const achievementId = parseNumericId(req.params.id);
    if (!achievementId) {
      return res.status(400).json({
        success: false,
        error: "Invalid achievement id",
      });
    }

    const tenantId = req.tenantId;
    if (!tenantId) {
      return res.status(500).json({
        success: false,
        error: "Tenant context missing",
      });
    }

    const achievement = await prisma.achievement.findUnique({ where: { id: achievementId } });
    if (!achievement) {
      return res.status(404).json({
        success: false,
        error: "Achievement not found",
      });
    }

    const progressCount = await prisma.userAchievement.count({
      where: { achievementId },
    });

    if (progressCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Achievement has progress records",
      });
    }

    await prisma.achievement.delete({ where: { id: achievement.id } });

    const response: ApiSuccessResponse<{ deleted: boolean }> = {
      success: true,
      data: { deleted: true },
    };
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
