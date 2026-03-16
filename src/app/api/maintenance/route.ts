import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/maintenance — public endpoint to check maintenance status
export async function GET() {
    try {
        const settings = await prisma.siteSetting.findMany({
            where: {
                key: { in: ["maintenanceMode", "maintenanceReason", "maintenanceEstimatedEnd"] },
            },
        });
        const map = Object.fromEntries(settings.map(s => [s.key, s.value]));
        return NextResponse.json({
            maintenance: map.maintenanceMode === "true",
            reason: map.maintenanceReason || null,
            estimatedEnd: map.maintenanceEstimatedEnd || null,
        });
    } catch {
        return NextResponse.json({ maintenance: false, reason: null, estimatedEnd: null });
    }
}
