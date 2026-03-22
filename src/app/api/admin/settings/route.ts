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

/**
 * PUT /api/admin/settings — bulk upsert site settings
 * Body: { settings: { key: value, key2: value2, ... } }
 */
export async function PUT(req: Request) {
    if (!(await checkAdmin())) return unauthorizedResponse();
    try {
        const body = await req.json();
        const parsed = settingSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
        }

        const { settings } = parsed.data;

        // Known settings with their types and descriptions
        const KNOWN_SETTINGS: Record<string, { type: string; description: string }> = {
            maintenanceMode: { type: "boolean", description: "Site bakım modu" },
            maintenanceReason: { type: "json", description: "Bakım sebebi (dil bazlı JSON)" },
            maintenanceEstimatedEnd: { type: "string", description: "Tahmini bitiş zamanı (ISO UTC)" },
            site_version: { type: "string", description: "Site sürümü" },
            github_url: { type: "string", description: "GitHub URL" },
            bmc_url: { type: "string", description: "Buy Me a Coffee URL" },
            contact_email: { type: "string", description: "İletişim e-posta adresi" },
            author_name: { type: "string", description: "Geliştirici / yazar adı" },
            author_url: { type: "string", description: "Yazar web sitesi URL" },
            default_lang: { type: "string", description: "Varsayılan dil kodu" },
            default_theme: { type: "string", description: "Varsayılan tema (dark/light)" },
            script_format: { type: "string", description: "Script çıktı formatı" },
            bmc_widget_enabled: { type: "boolean", description: "Buy Me a Coffee widget aktif mi" },
            copyright_text: { type: "string", description: "Footer copyright metni" },
            copyright_year: { type: "string", description: "Footer copyright yılı" },
        };

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
