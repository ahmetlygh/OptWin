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

        // 1. Fetch the entire hash of feature selection counts
        const featureCountsMap = await redisClient.hgetall("optwin:stats:features");
        
        // 2. Clear the hash in Redis instantly, inside a pipeline
        const pipeline = redisClient.pipeline();
        pipeline.del("optwin:stats:features");

        // 3. Increment total scripts count in DB too
        const totalScriptsStr = await redisClient.get("optwin:stats:total_scripts_generated");
        if (totalScriptsStr) {
            pipeline.del("optwin:stats:total_scripts_generated");
            // Prisma query setup goes here or separate endpoint
        }

        // Prepare operations for Prisma
        const updateOperations = Object.entries(featureCountsMap).map(([slug, countStr]) => {
            const count = parseInt(countStr, 10);
            return prisma.feature.updateMany({
                where: { slug },
                data: { selectCount: { increment: count } }
            });
        });

        if (updateOperations.length > 0) {
            await prisma.$transaction(updateOperations);
        }

        await pipeline.exec(); // Execute the purge finally
        
        return NextResponse.json({ 
            success: true, 
            flushedFeatures: Object.keys(featureCountsMap).length 
        });
    } catch (error) {
        console.error("Failed to sync stats:", error);
        return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
}
