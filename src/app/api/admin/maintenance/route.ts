import { NextResponse } from "next/server";
import { checkAdmin, unauthorizedResponse } from "@/lib/admin-guard";
import { z } from "zod";
import { settingsService } from "@/lib/settingsService";
import { redisClient } from "@/lib/redis";

const maintenanceSchema = z.object({
    enabled: z.boolean(),
    reason: z.string().max(500).default(""),
    estimatedEnd: z.string().max(100).default(""),
});

// GET /api/admin/maintenance — get maintenance mode status + details
export async function GET() {
    if (!(await checkAdmin())) return unauthorizedResponse();
    try {
        const settings = await settingsService.getSettings<Record<string, string>>(
            ["maintenanceMode", "maintenanceReason", "maintenanceEstimatedEnd"]
        );
        return NextResponse.json({
            success: true,
            maintenance: settings.maintenanceMode === "true",
            reason: settings.maintenanceReason || "",
            estimatedEnd: settings.maintenanceEstimatedEnd || "",
        });
    } catch {
        return NextResponse.json({ success: false, maintenance: false, reason: "", estimatedEnd: "" });
    }
}

// PUT /api/admin/maintenance — toggle maintenance mode with optional reason + estimatedEnd
export async function PUT(req: Request) {
    if (!(await checkAdmin())) return unauthorizedResponse();

    try {
        const body = await req.json();
        const parsed = maintenanceSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
        }
        const { enabled, reason, estimatedEnd } = parsed.data;

        await settingsService.updateSettings([
            { key: "maintenanceMode", value: enabled ? "true" : "false", type: "boolean", description: "Site bakım modu" },
            { key: "maintenanceReason", value: reason, type: "string", description: "Bakım sebebi" },
            { key: "maintenanceEstimatedEnd", value: estimatedEnd, type: "string", description: "Tahmini bitiş zamanı (ISO UTC)" }
        ]);

        try {
            await redisClient.publish("optwin:channels:maintenance", String(enabled));
        } catch (e) {
            console.error("Failed to publish maintenance state to Redis", e);
        }

        return NextResponse.json({ success: true, maintenance: enabled, reason, estimatedEnd });
    } catch (error: unknown) {
        console.error("Maintenance toggle error:", error);
        return NextResponse.json({ error: "Failed to toggle maintenance" }, { status: 500 });
    }
}
