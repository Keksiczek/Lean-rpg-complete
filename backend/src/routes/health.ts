import { Router, Request, Response } from "express";
import os from "os";
import { performance } from "perf_hooks";
import prisma from "../lib/prisma.js";
import redis from "../lib/redis.js";
import { geminiService } from "../services/GeminiService.js";
import logger from "../lib/logger.js";
import { getQueueStats } from "../queue/queueFactory.js";

const router = Router();

const measureLatency = async (fn: () => Promise<void>): Promise<SubsystemHealth> => {
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
    uptime: number;
    gemini_circuit: string;
    gemini_failures: number;
    gemini_last_failure: Date | null;
    hostname: string;
    queue_stats?: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
  };
}

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

    const geminiCircuit = geminiService.getCircuitBreakerState();
    const gemini: GeminiHealth = {
      circuit_breaker: geminiCircuit.state.toUpperCase(),
      failures: geminiCircuit.failureCount,
      last_failure: geminiCircuit.lastFailure,
    };

    const memory = getMemoryUsage();

    const circuitState = geminiService.getCircuitBreakerState();
    let queueStats: HealthResponse["details"]["queue_stats"];
    try {
      const stats = await getQueueStats();
      queueStats = stats.summary;
    } catch (error) {
      logger.error("Healthcheck queue stats failed", {
        context: "health",
        error,
        requestId,
      });
    }

    const memUsage = process.memoryUsage();
    const memUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memRss = Math.round(memUsage.rss / 1024 / 1024);

    const circuitState = geminiService.getCircuitBreakerState();

    let status: HealthStatus = "ok";
    if (dbStatus === "error" && redisStatus === "error") {
      status = "error";
    } else if (
      dbStatus === "error" ||
      redisStatus === "error" ||
      circuitState.state === "open"
    ) {
      status = "degraded";
    }

    const payload: HealthPayload = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      database,
      redis: redisStatus,
      queue,
      gemini,
      memory,
      uptime_seconds: Math.floor(process.uptime()),
      requestId,
      details: {
        database: dbStatus,
        redis: redisStatus,
        memory: {
          used: `${memUsed}MB`,
          rss: `${memRss}MB`,
        },
        uptime: Math.floor(process.uptime()),
        gemini_circuit: circuitState.state,
        gemini_failures: circuitState.failureCount,
        gemini_last_failure: circuitState.lastFailure,
        hostname: os.hostname(),
        queue_stats: queueStats,
      },
    };

    res.status(overallStatus === "unhealthy" ? 503 : 200).json(payload);
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
