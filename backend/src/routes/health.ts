import { Router, Request, Response } from "express";
import os from "os";
import { performance } from "perf_hooks";
import prisma from "../lib/prisma.js";
import { getRedis } from "../lib/redis.js";
import logger from "../lib/logger.js";
import { getQueueStats } from "../queue/queueFactory.js";
import { geminiService } from "../services/GeminiService.js";
import {
  QueueHealth,
  HealthPayload,
  MemoryUsageMb,
  OverallStatus,
  SubsystemHealth,
  CircuitState,
} from "../types/health.js";

const router = Router();

const measureLatency = async (fn: () => Promise<unknown>): Promise<SubsystemHealth> => {
  const start = performance.now();
  try {
    await fn();
    return { status: "connected", latency_ms: performance.now() - start };
  } catch (error) {
    return {
      status: "error",
      latency_ms: performance.now() - start,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const toMb = (bytes: number) => Math.round(bytes / 1024 / 1024);

const getMemoryUsage = (): MemoryUsageMb => {
  const mem = process.memoryUsage();
  return {
    used_mb: toMb(mem.heapUsed),
    rss_mb: toMb(mem.rss),
    heap_mb: toMb(mem.heapTotal),
  };
};

router.get("/health", async (req: Request, res: Response) => {
  const requestId = (req as Request & { requestId?: string }).requestId;
  const redisClient = getRedis();

  try {
    const [database, redisStatus] = await Promise.all([
      measureLatency(() => prisma.$queryRaw`SELECT 1` as any),
      measureLatency(() => redisClient.ping() as any),
    ]);

    let queue: QueueHealth = {
      status: "stopped",
      pending_jobs: 0,
      completed_jobs: 0,
      failed_jobs: 0,
    };

    try {
      const stats = await getQueueStats();
      queue = {
        status: "running",
        pending_jobs: stats.summary.waiting,
        completed_jobs: stats.summary.completed,
        failed_jobs: stats.summary.failed,
      };
    } catch (error) {
      logger.error("Queue stats failed", { context: "health", error, requestId });
    }

    const circuitState = geminiService.getCircuitBreakerState();
    const circuitBreakerState: CircuitState =
      circuitState.state === "half-open"
        ? "HALF_OPEN"
        : (circuitState.state.toUpperCase() as CircuitState);

    const gemini = {
      circuit_breaker: circuitBreakerState,
      failures: circuitState.failureCount,
      last_failure: circuitState.lastFailure?.toISOString() ?? null,
    };

    const memory = getMemoryUsage();

    let status: OverallStatus = "healthy";
    if (database.status === "error" || redisStatus.status === "error") {
      status = "unhealthy";
    } else if (queue.status === "stopped" || gemini.circuit_breaker === "OPEN") {
      status = "degraded";
    }

    const payload: HealthPayload = {
      status,
      timestamp: new Date().toISOString(),
      database,
      redis: redisStatus,
      queue,
      gemini,
      memory,
      uptime_seconds: Math.floor(process.uptime()),
      requestId,
      hostname: os.hostname(),
    };

    res.status(status === "unhealthy" ? 503 : 200).json(payload);
  } catch (error) {
    logger.error("Health check fatal error", { context: "health", error, requestId });
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: { status: "error", latency_ms: 0 },
      redis: { status: "error", latency_ms: 0 },
      queue: { status: "stopped", pending_jobs: 0, completed_jobs: 0, failed_jobs: 0 },
      gemini: { circuit_breaker: "OPEN", failures: 0, last_failure: null },
      memory: getMemoryUsage(),
      uptime_seconds: Math.floor(process.uptime()),
      requestId,
      hostname: os.hostname(),
    });
  }
});

export default router;
