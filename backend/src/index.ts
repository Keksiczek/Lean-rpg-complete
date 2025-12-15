import { app } from "./app.js";
import { config } from "./config.js";
import logger from "./lib/logger.js";
import { getRedis, closeRedis } from "./lib/redis.js";
import { getSubmissionQueue, closeQueue } from "./queue/queueFactory.js";
import { startSubmissionWorker } from "./queue/submissionWorker.js";
import { geminiService } from "./services/GeminiService.js";
import { registerGeminiProcessor } from "./queue/geminiJobs.js";

const PORT = config.app.port;
const HOST = config.app.host;

async function startServer() {
  try {
    const redis = getRedis();
    await redis.ping();
    logger.info({ message: "Redis connected" });

    await startSubmissionWorker();
    logger.info("Submission worker started");

    registerGeminiProcessor(geminiService);

    const server = app.listen(PORT, HOST, () => {
      logger.info({
        message: "Server started",
        port: PORT,
        host: HOST,
        environment: config.env,
      });
    });

    const shutdown = async (signal: string) => {
      logger.info({
        message: "shutdown_initiated",
        signal,
      });

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          const queue = getSubmissionQueue();
          logger.info("Draining job queue...");
          await queue.drain();
          logger.info("Job queue drained");
        } catch (error) {
          logger.error({
            message: "queue_drain_failed",
            error: error instanceof Error ? error.message : String(error),
          });
        }

        await closeQueue();
        await closeRedis();

        logger.info("Shutdown complete");
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("Forced shutdown after 30s timeout");
        process.exit(1);
      }, 30_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error({
      message: "server_startup_failed",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

startServer();

process.on("uncaughtException", (err) => {
  logger.error({
    message: "Uncaught exception",
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error({
    message: "Unhandled rejection",
    error: String(reason),
  });
});
