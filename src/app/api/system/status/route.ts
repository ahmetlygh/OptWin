import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key: "maintenance_mode" }
        });

        // if "true" -> true, else false
        const isMaintenance = setting?.value === "true";

        return NextResponse.json({
            success: true,
            maintenance: isMaintenance
        });
    } catch (error) {
        console.error("Status API error:", error);
        return NextResponse.json(
            { success: false, error: "Database error", maintenance: false },
            { status: 500 }
        );
    }
}
