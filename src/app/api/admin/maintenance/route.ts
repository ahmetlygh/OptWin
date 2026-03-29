import { NextResponse } from "next/server";
import { checkAdmin, unauthorizedResponse } from "@/lib/admin-guard";
import { z } from "zod";
import { settingsService } from "@/lib/settingsService";
import { redisClient, redisCache } from "@/lib/redis";

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
        }, {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
                "Surrogate-Control": "no-store"
            }
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

        // Purge ONLY public content caches (translations, features, presets)
        // DO NOT purge maintenance keys — proxy.ts reads them directly from Redis
        // and they MUST be present when SSE-triggered redirects arrive
        const LOCALES = ["en", "tr", "de", "fr", "es", "zh", "hi"];
        const contentKeysToPurge = [
            "optwin:entity:feature_slugs",
            "optwin:entity:dns",
        ];
        
        LOCALES.forEach(lang => {
            contentKeysToPurge.push(`optwin:translations:${lang}`);
            contentKeysToPurge.push(`optwin:entity:feature:${lang}`);
            contentKeysToPurge.push(`optwin:entity:category:${lang}`);
            contentKeysToPurge.push(`optwin:entity:preset:${lang}`);
            contentKeysToPurge.push(`optwin:cache:features_all:${lang}`);
            contentKeysToPurge.push(`optwin:cache:labels:${lang}`);
        });

        // Aggressive Cache Invalidation when disabling maintenance
        if (!enabled) {
            try {
                const { revalidatePath } = await import("next/cache");
                revalidatePath("/", "layout");
                await redisClient.del("siteSettings:hero");
            } catch (e) {
                console.error("Failed aggressive revalidation/purge", e);
            }
        }

        try {
            // 1. Purge content caches
            if (contentKeysToPurge.length > 0) {
                await redisClient.del(contentKeysToPurge);
            }

            // 2. Re-set maintenance keys in Redis BEFORE publishing SSE
            //    This ensures proxy.ts reads the correct state when the
            //    SSE-triggered client redirect request arrives
            await redisCache.set("optwin:setting:maintenanceMode", enabled ? "true" : "false", 86400);
            await redisCache.set("optwin:setting:maintenanceReason", reason, 86400);
            await redisCache.set("optwin:setting:maintenanceEstimatedEnd", estimatedEnd, 86400);

            // 3. Publish AFTER Redis is hot — clients redirect, proxy reads correct state
            await redisClient.publish("optwin:channels:maintenance", String(enabled));
        } catch (e) {
            console.error("Failed to publish or purge maintenance state to Redis", e);
        }

        return NextResponse.json({ success: true, maintenance: enabled, reason, estimatedEnd });
    } catch (error: unknown) {
        console.error("Maintenance toggle error:", error);
        return NextResponse.json({ error: "Failed to toggle maintenance" }, { status: 500 });
    }
}
