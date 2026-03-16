import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

async function checkAdmin() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || !(session as any).isAdmin) return false;
    return true;
}

// GET /api/admin/features — list all features with translations, commands, category
export async function GET(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const risk = searchParams.get("risk");
    const search = searchParams.get("search");

    const where: any = {};
    if (category) where.categoryId = category;
    if (risk) where.risk = risk;

    const features = await prisma.feature.findMany({
        where,
        orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
        include: {
            translations: true,
            commands: true,
            category: { include: { translations: true } },
        },
    });

    let result = features;
    if (search) {
        const q = search.toLowerCase();
        result = features.filter(f => {
            const titles = f.translations.map(t => t.title.toLowerCase());
            return f.slug.toLowerCase().includes(q) || titles.some(t => t.includes(q));
        });
    }

    return NextResponse.json({ success: true, features: result });
}

// POST /api/admin/features — create a new feature
export async function POST(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { slug, categoryId, icon, iconType, risk, noRisk, order, enabled, newBadge, newBadgeExpiry, translations, commands } = body;

        if (!slug || !categoryId) {
            return NextResponse.json({ error: "slug and categoryId are required" }, { status: 400 });
        }

        const feature = await prisma.feature.create({
            data: {
                slug,
                categoryId,
                icon: icon || "settings",
                iconType: iconType || "solid",
                risk: risk || "low",
                noRisk: noRisk || false,
                order: order || 0,
                enabled: enabled !== false,
                newBadge: newBadge || false,
                newBadgeExpiry: newBadgeExpiry ? new Date(newBadgeExpiry) : null,
                translations: {
                    create: (translations || []).map((t: any) => ({
                        lang: t.lang,
                        title: t.title,
                        desc: t.desc || "",
                    })),
                },
                commands: {
                    create: (commands || []).map((c: any) => ({
                        lang: c.lang,
                        command: c.command || "",
                        scriptMessage: c.scriptMessage || "",
                    })),
                },
            },
            include: { translations: true, commands: true },
        });

        return NextResponse.json({ success: true, feature });
    } catch (error: any) {
        console.error("Create feature error:", error);
        if (error.code === "P2002") {
            return NextResponse.json({ error: "A feature with this slug already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to create feature" }, { status: 500 });
    }
}

// PUT /api/admin/features — update feature
export async function PUT(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { id, slug, categoryId, icon, iconType, risk, noRisk, order, enabled, newBadge, newBadgeExpiry, translations, commands } = body;

        if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

        const data: any = {};
        if (slug !== undefined) data.slug = slug;
        if (categoryId !== undefined) data.categoryId = categoryId;
        if (icon !== undefined) data.icon = icon;
        if (iconType !== undefined) data.iconType = iconType;
        if (risk !== undefined) data.risk = risk;
        if (noRisk !== undefined) data.noRisk = noRisk;
        if (order !== undefined) data.order = order;
        if (enabled !== undefined) data.enabled = enabled;
        if (newBadge !== undefined) data.newBadge = newBadge;
        if (newBadgeExpiry !== undefined) data.newBadgeExpiry = newBadgeExpiry ? new Date(newBadgeExpiry) : null;

        const feature = await prisma.feature.update({
            where: { id },
            data,
        });

        // Update translations
        if (translations) {
            for (const t of translations) {
                await prisma.featureTranslation.upsert({
                    where: { featureId_lang: { featureId: id, lang: t.lang } },
                    create: { featureId: id, lang: t.lang, title: t.title, desc: t.desc || "" },
                    update: { title: t.title, desc: t.desc || "" },
                });
            }
        }

        // Update commands
        if (commands) {
            for (const c of commands) {
                await prisma.featureCommand.upsert({
                    where: { featureId_lang: { featureId: id, lang: c.lang } },
                    create: { featureId: id, lang: c.lang, command: c.command || "", scriptMessage: c.scriptMessage || "" },
                    update: { command: c.command || "", scriptMessage: c.scriptMessage || "" },
                });
            }
        }

        const updated = await prisma.feature.findUnique({
            where: { id },
            include: { translations: true, commands: true, category: { include: { translations: true } } },
        });

        return NextResponse.json({ success: true, feature: updated });
    } catch (error) {
        console.error("Update feature error:", error);
        return NextResponse.json({ error: "Failed to update feature" }, { status: 500 });
    }
}

// PATCH /api/admin/features — bulk move features from one category to another
export async function PATCH(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { categoryId, newCategoryId } = await req.json();
        if (!categoryId || !newCategoryId) {
            return NextResponse.json({ error: "categoryId and newCategoryId are required" }, { status: 400 });
        }
        const result = await prisma.feature.updateMany({
            where: { categoryId },
            data: { categoryId: newCategoryId },
        });
        return NextResponse.json({ success: true, moved: result.count });
    } catch (error) {
        console.error("Move features error:", error);
        return NextResponse.json({ error: "Failed to move features" }, { status: 500 });
    }
}

// DELETE /api/admin/features?id=xxx
export async function DELETE(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    try {
        await prisma.feature.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete feature error:", error);
        return NextResponse.json({ error: "Failed to delete feature" }, { status: 500 });
    }
}
