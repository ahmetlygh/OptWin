import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createHash } from "crypto";

function hashIp(ip: string): string {
    return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

// GET /api/stats -> returns { totalVisits, totalScripts, totalDownloads }
export async function GET() {
    try {
        const stats = await prisma.siteStats.upsert({
            where: { id: "main" },
            create: { id: "main", totalVisits: 0, totalScripts: 0, totalDownloads: 0 },
            update: {},
        });

        return NextResponse.json({
            success: true,
            totalVisits: stats.totalVisits,
            totalScripts: stats.totalScripts,
            totalDownloads: stats.totalDownloads
        });
    } catch (error: unknown) {
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
            }).catch((err: unknown) => console.warn("Dedup cleanup failed:", err));
        }

        // Build increment data based on action
        const incrementField = action === "visit"
            ? { totalVisits: { increment: 1 } }
            : action === "script"
                ? { totalScripts: { increment: 1 } }
                : { totalDownloads: { increment: 1 } };

        const createField = action === "visit"
            ? { totalVisits: 1 }
            : action === "script"
                ? { totalScripts: 1 }
                : { totalDownloads: 1 };

        // Atomic upsert — no race condition
        const stats = await prisma.siteStats.upsert({
            where: { id: "main" },
            create: { id: "main", totalVisits: 0, totalScripts: 0, totalDownloads: 0, ...createField },
            update: incrementField,
        });

        // Daily stats — also atomic upsert
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyCreate = {
            visits: action === "visit" ? 1 : 0,
            scripts: action === "script" ? 1 : 0,
            downloads: action === "download" ? 1 : 0,
        };
        const dailyIncrement = action === "visit"
            ? { visits: { increment: 1 } }
            : action === "script"
                ? { scripts: { increment: 1 } }
                : { downloads: { increment: 1 } };

        await prisma.dailyStat.upsert({
            where: { date: today },
            create: { date: today, ...dailyCreate },
            update: dailyIncrement,
        });

        return NextResponse.json({
            success: true,
            totalVisits: stats.totalVisits,
            totalScripts: stats.totalScripts,
            totalDownloads: stats.totalDownloads
        });
    } catch (error: unknown) {
        console.error("Stats API POST error:", error);
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
}
