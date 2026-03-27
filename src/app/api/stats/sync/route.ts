import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { redisClient } from "@/lib/redis";

const CRON_SECRET = process.env.CRON_SECRET || "development-secret";

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}` && process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        if (redisClient.status !== "ready" && redisClient.status !== "connecting") {
            return NextResponse.json({ error: "Redis not available" }, { status: 500 });
        }

        const globalKey = "optwin:stats:global";
        const featuresKey = "optwin:stats:features";

        // 1. Fetch buffered counters from Redis
        const [globalStats, featureCountsMap] = await Promise.all([
            redisClient.hgetall(globalKey),
            redisClient.hgetall(featuresKey)
        ]);

        // 2. Prepare atomic cleanup in Redis
        const pipeline = redisClient.pipeline();
        pipeline.del(globalKey);
        pipeline.del(featuresKey);

        // 3. Persist Global Site Stats (SiteStats table)
        const visits = parseInt(globalStats.visits || "0", 10);
        const scripts = parseInt(globalStats.scripts || "0", 10);
        const downloads = parseInt(globalStats.downloads || "0", 10);

        if (visits > 0 || scripts > 0 || downloads > 0) {
            await prisma.siteStats.upsert({
                where: { id: "main" },
                update: {
                    totalVisits: { increment: visits },
                    totalScripts: { increment: scripts },
                    totalDownloads: { increment: downloads }
                },
                create: { id: "main", totalVisits: visits, totalScripts: scripts, totalDownloads: downloads }
            });
        }

        // 4. Persist Daily Stats (DailyStat table - only for current day)
        const todayStr = new Date().toISOString().split('T')[0];
        const dailyKey = `optwin:stats:daily:${todayStr}`;
        const dailyStats = await redisClient.hgetall(dailyKey);
        
        const dVisits = parseInt(dailyStats.visits || "0", 10);
        const dScripts = parseInt(dailyStats.scripts || "0", 10);
        const dDownloads = parseInt(dailyStats.downloads || "0", 10);

        if (dVisits > 0 || dScripts > 0 || dDownloads > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            await prisma.dailyStat.upsert({
                where: { date: today },
                update: {
                    visits: { increment: dVisits },
                    scripts: { increment: dScripts },
                    downloads: { increment: dDownloads }
                },
                create: { date: today, visits: dVisits, scripts: dScripts, downloads: dDownloads }
            });

            // Wipe Redis Daily Buffer after syncing
            pipeline.del(dailyKey);
        }

        // 5. Persist Feature-Specific Selection Counts
        const featureOps = Object.entries(featureCountsMap).map(([slug, countStr]) => {
            const count = parseInt(countStr, 10);
            return prisma.feature.update({
                where: { slug },
                data: { selectCount: { increment: count } }
            });
        });

        if (featureOps.length > 0) {
            await prisma.$transaction(featureOps);
        }

        // 6. DB MAINTENANCE: Cleanup old Dedup entries (Task 1 relocated logic)
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        await prisma.visitDedup.deleteMany({
            where: { date: { lt: twoDaysAgo } }
        });

        // 7. Commit Redis Flush
        await pipeline.exec();

        return NextResponse.json({ 
            success: true, 
            syncedGlobal: { visits, scripts, downloads },
            syncedFeaturesCount: featureOps.length 
        });
    } catch (error: unknown) {
        console.error("Failed to sync stats:", error);
        return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
}
