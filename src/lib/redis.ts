import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const globalForRedis = global as unknown as { redis: Redis };

export const redisClient =
    globalForRedis.redis ||
    new Redis(REDIS_URL, {
        maxRetriesPerRequest: 1,
        commandTimeout: 1000,
        enableAutoPipelining: true,
        retryStrategy(times) {
            // Fail-fast: 3 denemeden sonra bırak, veritabanına düşsün
            if (times > 3) return null;
            return Math.min(times * 100, 1000);
        },
    });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redisClient;

// Hatalarda uygulamayı çöktürmeyen Fail-Safe Wrapper
export const redisCache = {
    async get(key: string): Promise<string | null> {
        try {
            if (redisClient.status !== "ready" && redisClient.status !== "connecting") return null;
            return await redisClient.get(key);
        } catch (e) {
            console.warn(`[Redis GET Error] ${key} - Fallback to DB.`);
            return null;
        }
    },
    async set(key: string, value: string, ttlSeconds: number = 86400): Promise<void> {
        try {
            if (redisClient.status !== "ready" && redisClient.status !== "connecting") return;
            await redisClient.set(key, value, "EX", ttlSeconds);
        } catch (e) {
            console.warn(`[Redis SET Error] ${key}`);
        }
    },
    async del(key: string | string[]): Promise<void> {
        if (!key || (Array.isArray(key) && key.length === 0)) return;
        try {
            if (redisClient.status !== "ready" && redisClient.status !== "connecting") return;
            if (Array.isArray(key)) {
                await redisClient.del(...key);
            } else {
                await redisClient.del(key);
            }
        } catch (e) {
            console.warn(`[Redis DEL Error] ${key}`);
        }
    },
    async mget(keys: string[]): Promise<(string | null)[]> {
        if (!keys.length) return [];
        try {
            if (redisClient.status !== "ready" && redisClient.status !== "connecting") return keys.map(() => null);
            return await redisClient.mget(keys);
        } catch (e) {
            console.warn(`[Redis MGET Error] Fallback to DB.`);
            return keys.map(() => null);
        }
    },
    async mset(entries: {key: string, value: string}[], ttlSeconds: number = 86400): Promise<void> {
        if (!entries.length) return;
        try {
            if (redisClient.status !== "ready" && redisClient.status !== "connecting") return;
            const pipeline = redisClient.pipeline();
            for (const { key, value } of entries) {
                pipeline.set(key, value, "EX", ttlSeconds);
            }
            await pipeline.exec();
        } catch (e) {
            console.warn(`[Redis MSET Error] Fallback skipping cache.`);
        }
    }
};
