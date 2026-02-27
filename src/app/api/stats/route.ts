import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/stats -> returns { totalVisits, totalScripts }
export async function GET() {
    try {
        let stats = await prisma.siteStats.findUnique({ where: { id: "main" } });

        if (!stats) {
            stats = await prisma.siteStats.create({
                data: { id: "main", totalVisits: 0, totalScripts: 0 }
            });
        }

        return NextResponse.json({
            success: true,
            totalVisits: stats.totalVisits,
            totalScripts: stats.totalScripts
        });
    } catch (error) {
        console.error("Stats API GET error:", error);
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
}

// POST /api/stats?action=visit|script -> increments counters
export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action !== "visit" && action !== "script") {
        return NextResponse.json({ success: false, error: "Invalid action parameter" }, { status: 400 });
    }

    try {
        let stats = await prisma.siteStats.findUnique({ where: { id: "main" } });

        if (!stats) {
            stats = await prisma.siteStats.create({
                data: { id: "main", totalVisits: 0, totalScripts: 0 }
            });
        }

        const incrementData = action === "visit" ? { totalVisits: 1 } : { totalScripts: 1 };
        stats = await prisma.siteStats.update({
            where: { id: "main" },
            data: {
                totalVisits: incrementData.totalVisits ? { increment: 1 } : undefined,
                totalScripts: incrementData.totalScripts ? { increment: 1 } : undefined,
            }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyData = action === "visit" ? { visits: 1 } : { scripts: 1 };
        await prisma.dailyStat.upsert({
            where: { date: today },
            create: { date: today, visits: dailyData.visits || 0, scripts: dailyData.scripts || 0 },
            update: {
                visits: dailyData.visits ? { increment: 1 } : undefined,
                scripts: dailyData.scripts ? { increment: 1 } : undefined,
            }
        });

        return NextResponse.json({
            success: true,
            totalVisits: stats.totalVisits,
            totalScripts: stats.totalScripts
        });
    } catch (error) {
        console.error("Stats API POST error:", error);
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
}
