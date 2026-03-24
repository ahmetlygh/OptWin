import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin, unauthorizedResponse } from "@/lib/admin-guard";
import { z } from "zod";

/**
 * GET /api/admin/settings — fetch all site settings (admin only)
 */
export async function GET() {
    if (!(await checkAdmin())) return unauthorizedResponse();
    try {
        const settings = await prisma.siteSetting.findMany({
            orderBy: { key: "asc" },
        });
        const map: Record<string, string> = {};
        settings.forEach(s => { map[s.key] = s.value; });
        return NextResponse.json({ success: true, settings: map });
    } catch {
        return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
    }
}

const settingSchema = z.object({
    settings: z.record(z.string(), z.string()).refine(
        obj => Object.keys(obj).length > 0,
        { message: "At least one setting is required" }
    ),
});

const dangerSchema = z.object({
    dangerAction: z.enum(["resetStats", "deleteMessages", "deleteDailyStats"]),
});

// Known settings with their types and descriptions
const KNOWN_SETTINGS: Record<string, { type: string; description: string }> = {
    maintenanceMode: { type: "boolean", description: "Site bakım modu" },
    maintenanceReason: { type: "json", description: "Bakım sebebi (dil bazlı JSON)" },
    maintenanceEstimatedEnd: { type: "string", description: "Tahmini bitiş zamanı (ISO UTC)" },
    site_url: { type: "string", description: "Site URL (örn: https://optwin.tech)" },
    site_name: { type: "string", description: "Site adı (örn: OptWin)" },
    site_description: { type: "string", description: "SEO için site açıklaması" },
    site_keywords: { type: "string", description: "SEO için anahtar kelimeler (virgülle ayrılmış)" },
    site_version: { type: "string", description: "Site sürümü" },
    github_url: { type: "string", description: "GitHub URL" },
    bmc_url: { type: "string", description: "Buy Me a Coffee URL" },
    contact_email: { type: "string", description: "İletişim e-posta adresi" },
    author_name: { type: "string", description: "Geliştirici / yazar adı" },
    author_url: { type: "string", description: "Yazar web sitesi URL" },
    default_lang: { type: "string", description: "Varsayılan dil kodu" },
    default_theme: { type: "string", description: "Varsayılan tema (dark/light)" },
    bmc_widget_enabled: { type: "boolean", description: "Buy Me a Coffee widget aktif mi" },
    copyright_text: { type: "string", description: "Footer copyright metni" },
    copyright_year: { type: "string", description: "Footer copyright yılı" },
};

/**
 * PUT /api/admin/settings — bulk upsert site settings
 * Body: { settings: { key: value, ... } }
 * 
 * Also handles danger zone actions:
 * Body: { dangerAction: "resetStats" | "deleteMessages" | "deleteDailyStats" }
 */
export async function PUT(req: Request) {
    if (!(await checkAdmin())) return unauthorizedResponse();
    try {
        const body = await req.json();

        // Check if this is a danger zone action
        const dangerParsed = dangerSchema.safeParse(body);
        if (dangerParsed.success) {
            const { dangerAction } = dangerParsed.data;

            switch (dangerAction) {
                case "resetStats": {
                    await prisma.$transaction([
                        prisma.siteStats.updateMany({
                            data: {
                                totalVisits: 0,
                                totalScripts: 0,
                                totalDownloads: 0,
                            },
                        }),
                        prisma.feature.updateMany({
                            data: { selectCount: 0 },
                        }),
                    ]);
                    return NextResponse.json({ success: true, message: "Tüm istatistikler sıfırlandı." });
                }
                case "deleteMessages": {
                    const result = await prisma.contactMessage.deleteMany({});
                    return NextResponse.json({ success: true, message: `${result.count} mesaj silindi.` });
                }
                case "deleteDailyStats": {
                    const result = await prisma.dailyStat.deleteMany({});
                    return NextResponse.json({ success: true, message: `${result.count} günlük istatistik kaydı silindi.` });
                }
            }
        }

        // Normal settings update
        const parsed = settingSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
        }

        const { settings } = parsed.data;

        const ops = Object.entries(settings).map(([key, value]) => {
            const meta = KNOWN_SETTINGS[key] || { type: "string", description: "" };
            return prisma.siteSetting.upsert({
                where: { key },
                create: { key, value, type: meta.type, description: meta.description },
                update: { value },
            });
        });

        await Promise.all(ops);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Settings update error:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
