import { NextResponse } from "next/server";
import { generateScript } from "@/lib/script-generator";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { checkMaintenanceStatus } from "@/lib/maintenance";

const scriptRequestSchema = z.object({
    features: z.array(z.string().max(100)).min(1).max(200),
    dnsProvider: z.string().max(50).nullable().optional(),
    lang: z.string().min(2).max(10).default("en"),
    createRestorePoint: z.boolean().default(false),
});

export async function POST(req: Request) {
    const maintenanceBlock = await checkMaintenanceStatus();
    if (maintenanceBlock) return maintenanceBlock;

    try {
        const body = await req.json();
        const parsed = scriptRequestSchema.safeParse(body);

        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message || "Invalid input";
            return NextResponse.json({ error: firstError }, { status: 400 });
        }

        const { features, dnsProvider, lang, createRestorePoint } = parsed.data;

        const scriptString = await generateScript({
            features,
            dnsProvider: dnsProvider ?? null,
            lang,
            createRestorePoint,
        });

        // Increment selectCount for each selected feature in Redis (fire and forget)
        if (features.length > 0) {
            const { redisClient } = await import("@/lib/redis"); // Lazy to preserve edge compatibility if any
            if (redisClient.status === "ready" || redisClient.status === "connecting") {
                const pipeline = redisClient.pipeline();
                features.forEach(slug => {
                    pipeline.hincrby("optwin:stats:features", slug, 1);
                });
                // Track total scripts generated separately via a counter
                pipeline.incr("optwin:stats:total_scripts_generated");
                pipeline.exec().catch(() => {});
            }
        }

        return NextResponse.json({ script: scriptString });
    } catch (error: unknown) {
        console.error("Script generation error:", error);
        return NextResponse.json({ error: "Failed to generate script" }, { status: 500 });
    }
}
