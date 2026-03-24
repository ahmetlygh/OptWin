import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

// GET /api/maintenance — public endpoint to check maintenance status
export async function GET() {
    try {
        const settings = await getSettings(["maintenanceMode", "maintenanceReason", "maintenanceEstimatedEnd"]);
        
        return NextResponse.json({
            maintenance: settings.maintenanceMode === "true",
            reason: settings.maintenanceReason || null,
            estimatedEnd: settings.maintenanceEstimatedEnd || null,
        });
    } catch {
        return NextResponse.json({ maintenance: false, reason: null, estimatedEnd: null });
    }
}
