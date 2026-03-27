import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createHash } from "crypto";
import { redisClient } from "@/lib/redis";

function hashIp(ip: string): string {
    return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

// GET /api/stats -> returns aggregated stats from DB
export async function GET() {
    try {
        const globalKey = "optwin:stats:global";
        const [stats, redisStats] = await Promise.all([
            prisma.siteStats.upsert({
                where: { id: "main" },
                create: { id: "main", totalVisits: 0, totalScripts: 0, totalDownloads: 0 },
                update: {},
            }),
            redisClient.hgetall(globalKey)
        ]);

        const totalVisits = stats.totalVisits + parseInt(redisStats.visits || "0", 10);
        const totalScripts = stats.totalScripts + parseInt(redisStats.scripts || "0", 10);
        const totalDownloads = stats.totalDownloads + parseInt(redisStats.downloads || "0", 10);

        return NextResponse.json({
            success: true,
            totalVisits,
            totalScripts,
            totalDownloads
        });
    } catch (error: unknown) {
        console.error("Stats API GET error:", error);
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
}

// POST /api/stats?action=visit|script|download -> HIGH-PERFORMANCE REDIS INCREMENT
export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action !== "visit" && action !== "script" && action !== "download") {
        return NextResponse.json({ success: false, error: "Invalid action parameter" }, { status: 400 });
    }

    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const globalKey = "optwin:stats:global";
        const dailyKey = `optwin:stats:daily:${todayStr}`;

        // 1. IP Dedup logic (Prisma create only, NO deletion here)
        if (action === "visit") {
            const forwarded = req.headers.get("x-forwarded-for");
            const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown";
            const ipHash = hashIp(ip);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            try {
                await prisma.visitDedup.create({
                    data: { ipHash, date: today }
                });
            } catch {
                // Already counted today
                return NextResponse.json({ success: true, alreadyCounted: true });
            }
        }

        // 2. Redis Increments
        const fieldMap: Record<string, string> = {
            visit: "visits",
            script: "scripts",
            download: "downloads"
        };
        const redisField = fieldMap[action];

        const pipeline = redisClient.pipeline();
        pipeline.hincrby(globalKey, redisField, 1);
        pipeline.hincrby(dailyKey, redisField, 1);
        pipeline.expire(dailyKey, 172800); // 48h TTL for daily stats buffer
        
        await pipeline.exec();

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Stats API POST error:", error);
        return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
    }
}
