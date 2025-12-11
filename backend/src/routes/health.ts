import { Router, Request, Response } from "express";
import os from "os";
import prisma from "../lib/prisma.js";
import redis from "../lib/redis.js";
import logger from "../lib/logger.js";
import { geminiService } from "../services/GeminiService.js";
import { getQueueStats } from "../queue/queueFactory.js";

const router = Router();

interface HealthDetails {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  database: {
    status: "connected" | "error";
    latency_ms: number;
  };
  redis: {
    status: "connected" | "error";
    latency_ms: number;
  };
  queue: {
    status: "running" | "stopped";
    pending_jobs: number;
    completed_jobs: number;
    failed_jobs: number;
  };
  gemini: {
    circuit_breaker: "CLOSED" | "OPEN" | "HALF_OPEN";
    failures: number;
    last_failure: Date | null;
  };
  memory: {
    used_mb: number;
    rss_mb: number;
    heap_mb: number;
  };
  uptime_seconds: number;
}

async function checkDatabase() {
  const start = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency_ms = Math.round(performance.now() - start);
    return { status: "connected" as const, latency_ms };
  } catch (error) {
    logger.error("Healthcheck database failed", { context: "health", error });
    return { status: "error" as const, latency_ms: Math.round(performance.now() - start) };
  }
}

async function checkRedis() {
  const start = performance.now();
  try {
    await redis.ping();
    const latency_ms = Math.round(performance.now() - start);
    return { status: "connected" as const, latency_ms };
  } catch (error) {
    logger.error("Healthcheck redis failed", { context: "health", error });
    return { status: "error" as const, latency_ms: Math.round(performance.now() - start) };
  }
}

async function checkQueue() {
  try {
    const stats = await getQueueStats();
    return {
      status: "running" as const,
      pending_jobs: stats.summary?.waiting ?? 0,
      completed_jobs: stats.summary?.completed ?? 0,
      failed_jobs: stats.summary?.failed ?? 0,
    };
  } catch (error) {
    logger.error("Healthcheck queue stats failed", { context: "health", error });
    return { status: "stopped" as const, pending_jobs: 0, completed_jobs: 0, failed_jobs: 0 };
  }
}

function getMemoryUsage() {
  const memUsage = process.memoryUsage();
  return {
    used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
    rss_mb: Math.round(memUsage.rss / 1024 / 1024),
    heap_mb: Math.round(memUsage.heapTotal / 1024 / 1024),
  };
}

router.get("/health", async (_req: Request, res: Response) => {
  const [database, redisStatus, queue] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkQueue(),
  ]);

  const circuit = geminiService.getCircuitBreakerState();
  const gemini = {
    circuit_breaker: circuit.state.toUpperCase() as HealthDetails["gemini"]["circuit_breaker"],
    failures: circuit.failureCount,
    last_failure: circuit.lastFailure,
  };

  let status: HealthDetails["status"] = "healthy";
  if (database.status === "error" || redisStatus.status === "error" || queue.status === "stopped") {
    status = "degraded";
  }
  if (database.status === "error" && redisStatus.status === "error") {
    status = "unhealthy";
  }

  const payload: HealthDetails = {
    status,
    timestamp: new Date().toISOString(),
    database,
    redis: redisStatus,
    queue,
    gemini,
    memory: getMemoryUsage(),
    uptime_seconds: Math.floor(process.uptime()),
  };

  return res.status(status === "unhealthy" ? 503 : 200).json(payload);
});

export default router;
