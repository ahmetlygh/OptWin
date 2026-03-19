import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin, unauthorizedResponse } from "@/lib/admin-guard";

// GET /api/admin/script-labels — get all script labels grouped by lang
export async function GET() {
    if (!(await checkAdmin())) return unauthorizedResponse();

    const [labels, metaSettings] = await Promise.all([
        prisma.scriptLabel.findMany({
            orderBy: [{ lang: "asc" }, { key: "asc" }],
        }),
        prisma.siteSetting.findMany({
            where: { key: { in: ["site_version", "script_extra_lines", "script_line_overrides", "script_deleted_preview_lines"] } },
        }),
    ]);
    const settingsMap = metaSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

    // Group by language
    const grouped: Record<string, Record<string, string>> = {};
    for (const label of labels) {
        if (!grouped[label.lang]) grouped[label.lang] = {};
        grouped[label.lang][label.key] = label.value;
    }

    // Get unique languages
    const languages = [...new Set(labels.map(l => l.lang))].sort();

    let extraLines = [];
    let lineOverrides = {};
    let deletedPreviewLines: number[] = [];
    try { extraLines = JSON.parse(settingsMap.script_extra_lines || "[]"); } catch {}
    try { lineOverrides = JSON.parse(settingsMap.script_line_overrides || "{}"); } catch {}
    try { deletedPreviewLines = JSON.parse(settingsMap.script_deleted_preview_lines || "[]"); } catch {}

    return NextResponse.json({
        success: true,
        labels: grouped,
        languages,
        siteVersion: settingsMap.site_version || "1.3.0",
        extraLines,
        lineOverrides,
        deletedPreviewLines,
    });
}

// PUT /api/admin/script-labels — update script labels
export async function PUT(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { labels, extraLines, lineOverrides, deletedPreviewLines } = body as {
            labels?: { lang: string; key: string; value: string }[];
            extraLines?: unknown;
            lineOverrides?: unknown;
            deletedPreviewLines?: unknown;
        };

        if (labels && Array.isArray(labels)) {
            for (const label of labels) {
                await prisma.scriptLabel.upsert({
                    where: { lang_key: { lang: label.lang, key: label.key } },
                    update: { value: label.value },
                    create: { lang: label.lang, key: label.key, value: label.value },
                });
            }
        }

        if (extraLines !== undefined) {
            await prisma.siteSetting.upsert({
                where: { key: "script_extra_lines" },
                update: { value: JSON.stringify(extraLines) },
                create: { key: "script_extra_lines", value: JSON.stringify(extraLines) },
            });
        }
        if (lineOverrides !== undefined) {
            await prisma.siteSetting.upsert({
                where: { key: "script_line_overrides" },
                update: { value: JSON.stringify(lineOverrides) },
                create: { key: "script_line_overrides", value: JSON.stringify(lineOverrides) },
            });
        }
        if (deletedPreviewLines !== undefined) {
            await prisma.siteSetting.upsert({
                where: { key: "script_deleted_preview_lines" },
                update: { value: JSON.stringify(deletedPreviewLines) },
                create: { key: "script_deleted_preview_lines", value: JSON.stringify(deletedPreviewLines) },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update script labels error:", error);
        return NextResponse.json({ error: "Failed to update script labels" }, { status: 500 });
    }
}

// DELETE /api/admin/script-labels — delete a specific label
export async function DELETE(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang");
    const key = searchParams.get("key");

    if (!lang || !key) {
        return NextResponse.json({ error: "lang and key are required" }, { status: 400 });
    }

    try {
        await prisma.scriptLabel.delete({
            where: { lang_key: { lang, key } },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete script label error:", error);
        return NextResponse.json({ error: "Failed to delete script label" }, { status: 500 });
    }
}
