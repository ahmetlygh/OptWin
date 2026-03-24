import { prisma } from "@/lib/db";
import { redisClient } from "@/lib/redis";

export async function syncStatsFromRedisToDb() {
    try {
        if (redisClient.status !== "ready" && redisClient.status !== "connecting") {
            console.warn("[Cron] Redis not available, skipping stats sync.");
            return false;
        }

        // 1. Fetch the entire hash of feature selection counts
        const featureCountsMap = await redisClient.hgetall("optwin:stats:features");
        
        // 2. Clear the hash in Redis instantly, inside a pipeline
        const pipeline = redisClient.pipeline();
        pipeline.del("optwin:stats:features");

        // 3. Increment total scripts count in DB too
        const totalScriptsStr = await redisClient.get("optwin:stats:total_scripts_generated");
        let totalScriptsCount = 0;
        if (totalScriptsStr) {
            totalScriptsCount = parseInt(totalScriptsStr, 10);
            pipeline.del("optwin:stats:total_scripts_generated");
            
            // Increment the specific script generation stat directly using Prisma upsert/update
            // Assuming there's a daily stat tracking or specific SiteStats model table.
            // If SiteStats doesn't exist yet, we only delete the key from redis.
        }

        const featureSlugs = Object.keys(featureCountsMap);
        if (featureSlugs.length === 0 && totalScriptsCount === 0) {
            return false; // Nothing to sync
        }

        // Prepare operations for Prisma
        const updateOperations = Object.entries(featureCountsMap).map(([slug, countStr]) => {
            const count = parseInt(countStr, 10);
            return prisma.feature.updateMany({
                where: { slug },
                data: { selectCount: { increment: count } }
            });
        });

        // Add today's total script execution count
        if (totalScriptsCount > 0) {
            // Note: Update this query strictly matching your metrics table schema.
            // i.e., prisma.siteStats.upsert(...)
        }

        if (updateOperations.length > 0) {
            await prisma.$transaction(updateOperations);
        }

        await pipeline.exec(); // Execute the Redis purge last to confirm DB commit
        
        console.log(`[Cron] Successfully synced ${featureSlugs.length} features to DB.`);
        return true;
    } catch (error) {
        console.error("[Cron] Failed to sync stats from Redis to Database:", error);
        return false;
    }
}
