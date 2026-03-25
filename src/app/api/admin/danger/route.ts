import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { redisCache } from "@/lib/redis";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
        const { action } = await req.json();

        switch (action) {
            case "resetStats":
                // 1. Update features table (selectCount)
                await prisma.feature.updateMany({
                    data: {
                        selectCount: 0
                    }
                });

                // 2. Clear DailyStat table
                await prisma.dailyStat.deleteMany({});

                // 3. Clear SiteStats total counts
                await prisma.siteStats.updateMany({
                    data: {
                        totalVisits: 0,
                        totalScripts: 0,
                        totalDownloads: 0
                    }
                });

                // 4. Clear cache to reflect 0s immediately
                await redisCache.del([
                    "optwin:stats:global",
                    "optwin:stats:daily",
                    "optwin:stats:features"
                ]);

                return NextResponse.json({ success: true, message: "Tüm istatistikler sıfırlandı." });

            case "deleteMessages":
                await prisma.contactMessage.deleteMany({});
                return NextResponse.json({ success: true, message: "Tüm mesajlar silindi." });

            case "deleteDailyStats":
                await prisma.dailyStat.deleteMany({});
                return NextResponse.json({ success: true, message: "Günlük istatistikler temizlendi." });

            default:
                return NextResponse.json({ success: false, error: "Geçersiz işlem." }, { status: 400 });
        }
    } catch (error: any) {
        console.error("Danger API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
