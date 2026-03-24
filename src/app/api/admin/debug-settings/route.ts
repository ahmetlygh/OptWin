import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { redisClient } from "@/lib/redis";

export async function GET() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const dbSettings = await prisma.siteSetting.findMany();
        const dbMap = dbSettings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

        let redisMap: Record<string, string | null> = {};
        if (redisClient.status === "ready" || redisClient.status === "connecting") {
            const keys = await redisClient.keys("setting:*");
            if (keys.length > 0) {
                const values = await redisClient.mget(keys);
                keys.forEach((k, i) => {
                    const originalKey = k.replace("setting:", "");
                    redisMap[originalKey] = values[i] || null;
                });
            }
        }

        return NextResponse.json({
            success: true,
            db: dbMap,
            redis: redisMap,
            redisStatus: redisClient.status,
            matches: {
                totalKeys: dbSettings.length,
                matchedKeys: dbSettings.filter(k => redisMap[k.key] === k.value).length
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
