import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/maintenance — public endpoint to check maintenance status
export async function GET() {
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key: "maintenanceMode" },
        });
        return NextResponse.json({
            maintenance: setting?.value === "true",
        });
    } catch {
        return NextResponse.json({ maintenance: false });
    }
}
