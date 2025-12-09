import Redis from "ioredis";
import { config } from "../config.js";
import logger from "./logger.js";

const redis = new Redis(config.REDIS_URL);

redis.on("error", (err) => {
  logger.error({ message: "redis_error", error: err });
});

export default redis;
