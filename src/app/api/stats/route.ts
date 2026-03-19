import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createHash } from "crypto";

function hashIp(ip: string): string {
    return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

// GET /api/stats -> returns { totalVisits, totalScripts, totalDownloads }
export async function GET() {
    try {
        let stats = await prisma.siteStats.findUnique({ where: { id: "main" } });

        if (!stats) {
            stats = await prisma.siteStats.create({
                data: { id: "main", totalVisits: 0, totalScripts: 0, totalDownloads: 0 }
            });
        }

        return NextResponse.json({
            success: true,
            totalVisits: stats.totalVisits,
            totalScripts: stats.totalScripts,
            totalDownloads: stats.totalDownloads
        });
    } catch (error) {
        console.error("Stats API GET error:", error);
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
}

// POST /api/stats?action=visit|script|download -> increments counters
export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action !== "visit" && action !== "script" && action !== "download") {
        return NextResponse.json({ success: false, error: "Invalid action parameter" }, { status: 400 });
    }

    try {
        // IP-based daily unique visit tracking
        if (action === "visit") {
            const forwarded = req.headers.get("x-forwarded-for");
            const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown";
            const ipHash = hashIp(ip);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Try to insert — unique constraint prevents duplicates
            try {
                await prisma.visitDedup.create({
                    data: { ipHash, date: today }
                });
            } catch {
                // Unique constraint violation = already counted today
                const stats = await prisma.siteStats.findUnique({ where: { id: "main" } });
                return NextResponse.json({
                    success: true,
                    alreadyCounted: true,
                    totalVisits: stats?.totalVisits || 0,
                    totalScripts: stats?.totalScripts || 0,
                    totalDownloads: stats?.totalDownloads || 0
                });
            }

            // Clean up old dedup entries (older than 2 days) — fire and forget
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            prisma.visitDedup.deleteMany({
                where: { date: { lt: twoDaysAgo } }
            }).catch(() => {});
        }

        let stats = await prisma.siteStats.findUnique({ where: { id: "main" } });

        if (!stats) {
            stats = await prisma.siteStats.create({
                data: { id: "main", totalVisits: 0, totalScripts: 0, totalDownloads: 0 }
            });
        }

        // Build increment data based on action
        const updateData: Record<string, { increment: number } | undefined> = {
            totalVisits: action === "visit" ? { increment: 1 } : undefined,
            totalScripts: action === "script" ? { increment: 1 } : undefined,
            totalDownloads: action === "download" ? { increment: 1 } : undefined,
        };

        stats = await prisma.siteStats.update({
            where: { id: "main" },
            data: updateData
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyCreate: Record<string, number> = {
            visits: action === "visit" ? 1 : 0,
            scripts: action === "script" ? 1 : 0,
            downloads: action === "download" ? 1 : 0
        };
        const dailyUpdate: Record<string, { increment: number } | undefined> = {
            visits: action === "visit" ? { increment: 1 } : undefined,
            scripts: action === "script" ? { increment: 1 } : undefined,
            downloads: action === "download" ? { increment: 1 } : undefined,
        };

        await prisma.dailyStat.upsert({
            where: { date: today },
            create: { date: today, ...dailyCreate },
            update: dailyUpdate
        });

        return NextResponse.json({
            success: true,
            totalVisits: stats.totalVisits,
            totalScripts: stats.totalScripts,
            totalDownloads: stats.totalDownloads
        });
    } catch (error) {
        console.error("Stats API POST error:", error);
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
}
