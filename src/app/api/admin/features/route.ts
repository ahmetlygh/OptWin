import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin, unauthorizedResponse } from "@/lib/admin-guard";
import { z } from "zod";
import { redisCache } from "@/lib/redis";
import { cacheService } from "@/lib/cache-service";

const SUPPORTED_LANGS = ["en", "tr", "de", "fr", "es", "zh", "hi"];

/** Purge all feature-related Redis caches so script generator picks up changes */
async function invalidateFeatureCache() {
    await cacheService.invalidate("feature");
}

/* ─── Zod schemas ─── */

const translationSchema = z.object({
    lang: z.string().max(5),
    title: z.string().max(500),
    desc: z.string().max(2000).default(""),
});

const commandSchema = z.object({
    lang: z.string().max(5),
    command: z.string().max(10000).default(""),
    scriptMessage: z.string().max(500).default(""),
});

const createFeatureSchema = z.object({
    slug: z.string().min(1).max(100),
    categoryId: z.string().min(1),
    icon: z.string().max(100).default("settings"),
    iconType: z.string().max(20).default("solid"),
    risk: z.enum(["low", "medium", "high"]).default("low"),
    noRisk: z.boolean().default(false),
    order: z.number().int().default(0),
    enabled: z.boolean().default(true),
    newBadge: z.boolean().default(false),
    newBadgeExpiry: z.string().nullable().optional(),
    translations: z.array(translationSchema).default([]),
    commands: z.array(commandSchema).default([]),
});

// Partial schemas for update operations (only update provided fields)
const partialTranslationSchema = z.object({
    lang: z.string().max(5),
    title: z.string().max(500).optional(),
    desc: z.string().max(2000).optional(),
});

const partialCommandSchema = z.object({
    lang: z.string().max(5),
    command: z.string().max(10000).optional(),
    scriptMessage: z.string().max(500).optional(),
});

const updateFeatureSchema = z.object({
    id: z.string().min(1),
    slug: z.string().min(1).max(100).optional(),
    categoryId: z.string().min(1).optional(),
    icon: z.string().max(100).optional(),
    iconType: z.string().max(20).optional(),
    risk: z.enum(["low", "medium", "high"]).optional(),
    noRisk: z.boolean().optional(),
    order: z.number().int().optional(),
    enabled: z.boolean().optional(),
    newBadge: z.boolean().optional(),
    newBadgeExpiry: z.string().nullable().optional(),
    translations: z.array(partialTranslationSchema).optional(),
    commands: z.array(partialCommandSchema).optional(),
});

const bulkMoveSchema = z.object({
    categoryId: z.string().min(1),
    newCategoryId: z.string().min(1),
});

/* ─── Handlers ─── */

// GET /api/admin/features — list all features with translations, commands, category
export async function GET(req: NextRequest) {
    if (!(await checkAdmin())) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const risk = searchParams.get("risk");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
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
    if (!(await checkAdmin())) return unauthorizedResponse();

    try {
        const body = await req.json();
        const parsed = createFeatureSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
        }

        const { slug, categoryId, icon, iconType, risk, noRisk, order, enabled, newBadge, newBadgeExpiry, translations, commands } = parsed.data;

        const feature = await prisma.feature.create({
            data: {
                slug,
                categoryId,
                icon,
                iconType,
                risk,
                noRisk,
                order,
                enabled,
                newBadge,
                newBadgeExpiry: newBadgeExpiry ? new Date(newBadgeExpiry) : null,
                translations: {
                    create: translations.map(t => ({
                        lang: t.lang,
                        title: t.title,
                        desc: t.desc,
                    })),
                },
                commands: {
                    create: commands.map(c => ({
                        lang: c.lang,
                        command: c.command,
                        scriptMessage: c.scriptMessage,
                    })),
                },
            },
            include: { translations: true, commands: true },
        });

        await invalidateFeatureCache();
        return NextResponse.json({ success: true, feature });
    } catch (error: unknown) {
        console.error("Create feature error:", error);
        const prismaError = error as { code?: string };
        if (prismaError.code === "P2002") {
            return NextResponse.json({ error: "A feature with this slug already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to create feature" }, { status: 500 });
    }
}

// PUT /api/admin/features — update feature
export async function PUT(req: NextRequest) {
    if (!(await checkAdmin())) return unauthorizedResponse();

    try {
        const body = await req.json();
        const parsed = updateFeatureSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
        }

        const { id, slug, categoryId, icon, iconType, risk, noRisk, order, enabled, newBadge, newBadgeExpiry, translations, commands } = parsed.data;

        const data: Record<string, unknown> = {};
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

        // Update translations & commands in parallel
        const upsertOps: Promise<unknown>[] = [];

        if (translations) {
            for (const t of translations) {
                const updateData: Record<string, string> = {};
                const createData: Record<string, string> = { featureId: id, lang: t.lang, title: "", desc: "" };
                if (t.title !== undefined) { updateData.title = t.title; createData.title = t.title; }
                if (t.desc !== undefined) { updateData.desc = t.desc; createData.desc = t.desc; }
                upsertOps.push(prisma.featureTranslation.upsert({
                    where: { featureId_lang: { featureId: id, lang: t.lang } },
                    create: createData as any,
                    update: updateData,
                }));
            }
        }

        if (commands) {
            for (const c of commands) {
                const updateData: Record<string, string> = {};
                const createData: Record<string, string> = { featureId: id, lang: c.lang, command: "", scriptMessage: "" };
                if (c.command !== undefined) { updateData.command = c.command; createData.command = c.command; }
                if (c.scriptMessage !== undefined) { updateData.scriptMessage = c.scriptMessage; createData.scriptMessage = c.scriptMessage; }
                upsertOps.push(prisma.featureCommand.upsert({
                    where: { featureId_lang: { featureId: id, lang: c.lang } },
                    create: createData as any,
                    update: updateData,
                }));
            }
        }

        if (upsertOps.length > 0) await Promise.all(upsertOps);

        const updated = await prisma.feature.findUnique({
            where: { id },
            include: { translations: true, commands: true, category: { include: { translations: true } } },
        });

        await invalidateFeatureCache();
        return NextResponse.json({ success: true, feature: updated });
    } catch (error: unknown) {
        console.error("Update feature error:", error);
        return NextResponse.json({ error: "Failed to update feature" }, { status: 500 });
    }
}

// PATCH /api/admin/features — bulk move features from one category to another
export async function PATCH(req: NextRequest) {
    if (!(await checkAdmin())) return unauthorizedResponse();

    try {
        const body = await req.json();
        const parsed = bulkMoveSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
        }

        const { categoryId, newCategoryId } = parsed.data;

        // Find the highest order in the target category
        const maxOrderFeature = await prisma.feature.findFirst({
            where: { categoryId: newCategoryId },
            orderBy: { order: "desc" },
            select: { order: true },
        });
        const startOrder = (maxOrderFeature?.order ?? 0) + 1;

        // Get features to move, sorted by their current order
        const toMove = await prisma.feature.findMany({
            where: { categoryId },
            orderBy: { order: "asc" },
            select: { id: true },
        });

        // Move in a single transaction
        await prisma.$transaction(
            toMove.map((f, i) =>
                prisma.feature.update({
                    where: { id: f.id },
                    data: { categoryId: newCategoryId, order: startOrder + i },
                })
            )
        );

        await invalidateFeatureCache();
        return NextResponse.json({ success: true, moved: toMove.length, startOrder });
    } catch (error: unknown) {
        console.error("Move features error:", error);
        return NextResponse.json({ error: "Failed to move features" }, { status: 500 });
    }
}

// DELETE /api/admin/features?id=xxx
export async function DELETE(req: NextRequest) {
    if (!(await checkAdmin())) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    try {
        await prisma.feature.delete({ where: { id } });
        await invalidateFeatureCache();
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Delete feature error:", error);
        return NextResponse.json({ error: "Failed to delete feature" }, { status: 500 });
    }
}
