import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin, unauthorizedResponse } from "@/lib/admin-guard";
import { redisCache } from "@/lib/redis";
// GET /api/admin/script-labels — get all script labels grouped by lang
export async function GET() {
    if (!(await checkAdmin())) return unauthorizedResponse();

    const [labels, metaSettings] = await Promise.all([
        prisma.scriptLabel.findMany({
            orderBy: [{ lang: "asc" }, { key: "asc" }],
        }),
        prisma.siteSetting.findMany({
            where: { key: { in: ["site_version", "script_extra_lines", "script_line_overrides", "script_deleted_preview_lines", "script_key_order"] } },
        }),
    ]);
    const settingsMap = metaSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

    // Group by language
    const grouped: Record<string, Record<string, string>> = {};
    for (const label of labels) {
        if (!grouped[label.lang]) grouped[label.lang] = {};
        grouped[label.lang][label.key] = label.value;
    }

    // Get unique languages from labels AND from active Language records
    const activeLangsFromDb = await prisma.language.findMany({
        where: { isActive: true },
        select: { code: true },
        orderBy: { sortOrder: "asc" },
    });
    const langCodesFromLabels = [...new Set(labels.map(l => l.lang))];
    const langCodesFromDb = activeLangsFromDb.map(l => l.code);
    const languages = [...new Set([...langCodesFromDb, ...langCodesFromLabels])].sort();

    let extraLines = [];
    let lineOverrides = {};
    let deletedPreviewLines: number[] = [];
    let keyOrder = {};
    try { extraLines = JSON.parse(settingsMap.script_extra_lines || "[]"); } catch {}
    try { lineOverrides = JSON.parse(settingsMap.script_line_overrides || "{}"); } catch {}
    try { deletedPreviewLines = JSON.parse(settingsMap.script_deleted_preview_lines || "[]"); } catch {}
    try { keyOrder = JSON.parse(settingsMap.script_key_order || "{}"); } catch {}

    return NextResponse.json({
        success: true,
        labels: grouped,
        languages,
        siteVersion: settingsMap.site_version || "1.3.0",
        extraLines,
        lineOverrides,
        deletedPreviewLines,
        keyOrder,
    });
}

// PUT /api/admin/script-labels — update script labels
export async function PUT(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { labels, deletedKeys, extraLines, lineOverrides, deletedPreviewLines, keyOrder } = body as {
            labels?: { lang: string; key: string; value: string }[];
            deletedKeys?: string[];
            extraLines?: unknown;
            lineOverrides?: unknown;
            deletedPreviewLines?: unknown;
            keyOrder?: unknown;
        };

        if (labels && Array.isArray(labels)) {
            await prisma.$transaction(
                labels.map((label) => 
                    prisma.scriptLabel.upsert({
                        where: { lang_key: { lang: label.lang, key: label.key } },
                        update: { value: label.value },
                        create: { lang: label.lang, key: label.key, value: label.value },
                    })
                )
            );
        }

        if (deletedKeys && Array.isArray(deletedKeys) && deletedKeys.length > 0) {
            await prisma.scriptLabel.deleteMany({
                where: { key: { in: deletedKeys } }
            });
        }

        if (extraLines !== undefined || lineOverrides !== undefined || deletedPreviewLines !== undefined || keyOrder !== undefined) {
            const updates = [];
            if (extraLines !== undefined) {
                updates.push(prisma.siteSetting.upsert({
                    where: { key: "script_extra_lines" },
                    update: { value: JSON.stringify(extraLines) },
                    create: { key: "script_extra_lines", value: JSON.stringify(extraLines) },
                }));
            }
            if (lineOverrides !== undefined) {
                updates.push(prisma.siteSetting.upsert({
                    where: { key: "script_line_overrides" },
                    update: { value: JSON.stringify(lineOverrides) },
                    create: { key: "script_line_overrides", value: JSON.stringify(lineOverrides) },
                }));
            }
            if (deletedPreviewLines !== undefined) {
                updates.push(prisma.siteSetting.upsert({
                    where: { key: "script_deleted_preview_lines" },
                    update: { value: JSON.stringify(deletedPreviewLines) },
                    create: { key: "script_deleted_preview_lines", value: JSON.stringify(deletedPreviewLines) },
                }));
            }
            if (keyOrder !== undefined) {
                updates.push(prisma.siteSetting.upsert({
                    where: { key: "script_key_order" },
                    update: { value: JSON.stringify(keyOrder) },
                    create: { key: "script_key_order", value: JSON.stringify(keyOrder) },
                }));
            }
            if (updates.length > 0) await prisma.$transaction(updates);
        }

        // Invalidate Redis cache for any SiteSetting keys modified
        const invalidateKeys: string[] = [];
        if (extraLines !== undefined) invalidateKeys.push("optwin:setting:script_extra_lines");
        if (lineOverrides !== undefined) invalidateKeys.push("optwin:setting:script_line_overrides");
        if (deletedPreviewLines !== undefined) invalidateKeys.push("optwin:setting:script_deleted_preview_lines");
        if (keyOrder !== undefined) invalidateKeys.push("optwin:setting:script_key_order");
        if (invalidateKeys.length > 0) {
            await redisCache.del(invalidateKeys);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update script labels error:", error);
        return NextResponse.json({ error: "Failed to update script labels" }, { status: 500 });
    }
}

// DELETE /api/admin/script-labels — delete a specific label or a key across all languages
export async function DELETE(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang");
    const key = searchParams.get("key");

    if (!key) {
        return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    try {
        if (lang) {
            await prisma.scriptLabel.delete({
                where: { lang_key: { lang, key } },
            });
        } else {
            // Delete from all languages
            await prisma.scriptLabel.deleteMany({
                where: { key: key },
            });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete script label error:", error);
        return NextResponse.json({ error: "Failed to delete script label" }, { status: 500 });
    }
}
