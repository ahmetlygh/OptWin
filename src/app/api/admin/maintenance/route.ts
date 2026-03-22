import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin, unauthorizedResponse } from "@/lib/admin-guard";
import { z } from "zod";

const maintenanceSchema = z.object({
    enabled: z.boolean(),
    reason: z.string().max(500).default(""),
    estimatedEnd: z.string().max(100).default(""),
});

// GET /api/admin/maintenance — get maintenance mode status + details
export async function GET() {
    if (!(await checkAdmin())) return unauthorizedResponse();
    try {
        const settings = await prisma.siteSetting.findMany({
            where: {
                key: { in: ["maintenanceMode", "maintenanceReason", "maintenanceEstimatedEnd"] },
            },
        });
        const map = Object.fromEntries(settings.map(s => [s.key, s.value]));
        return NextResponse.json({
            success: true,
            maintenance: map.maintenanceMode === "true",
            reason: map.maintenanceReason || "",
            estimatedEnd: map.maintenanceEstimatedEnd || "",
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

        // Upsert all three settings
        await Promise.all([
            prisma.siteSetting.upsert({
                where: { key: "maintenanceMode" },
                create: { key: "maintenanceMode", value: enabled ? "true" : "false", type: "boolean", description: "Site bakım modu" },
                update: { value: enabled ? "true" : "false" },
            }),
            prisma.siteSetting.upsert({
                where: { key: "maintenanceReason" },
                create: { key: "maintenanceReason", value: reason, type: "string", description: "Bakım sebebi" },
                update: { value: reason },
            }),
            prisma.siteSetting.upsert({
                where: { key: "maintenanceEstimatedEnd" },
                create: { key: "maintenanceEstimatedEnd", value: estimatedEnd, type: "string", description: "Tahmini bitiş zamanı (ISO UTC)" },
                update: { value: estimatedEnd },
            }),
        ]);

        return NextResponse.json({ success: true, maintenance: enabled, reason, estimatedEnd });
    } catch (error: unknown) {
        console.error("Maintenance toggle error:", error);
        return NextResponse.json({ error: "Failed to toggle maintenance" }, { status: 500 });
    }
}
