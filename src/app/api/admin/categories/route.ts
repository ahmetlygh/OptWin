import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin, unauthorizedResponse } from "@/lib/admin-guard";
import { z } from "zod";
import { redisCache } from "@/lib/redis";
import { cacheService } from "@/lib/cache-service";

const SUPPORTED_LANGS = ["en", "tr", "de", "fr", "es", "zh", "hi"];

/** Purge feature caches (category changes affect which features are visible) */
async function invalidateFeatureCache() {
    await cacheService.invalidate("category");
}
const catTranslationSchema = z.object({
    lang: z.string().max(5),
    name: z.string().max(200),
});

const createCategorySchema = z.object({
    slug: z.string().min(1).max(100),
    icon: z.string().max(100).nullable().default(null),
    order: z.number().int().default(0),
    enabled: z.boolean().default(true),
    translations: z.array(catTranslationSchema).default([]),
});

const updateCategorySchema = z.object({
    id: z.string().min(1),
    slug: z.string().min(1).max(100).optional(),
    icon: z.string().max(100).nullable().optional(),
    order: z.number().int().optional(),
    enabled: z.boolean().optional(),
    translations: z.array(catTranslationSchema).optional(),
});

// GET /api/admin/categories
export async function GET() {
    if (!(await checkAdmin())) return unauthorizedResponse();

    const categories = await prisma.category.findMany({
        orderBy: { order: "asc" },
        include: {
            translations: true,
            _count: { select: { features: true } },
        },
    });

    return NextResponse.json({ success: true, categories });
}

// POST /api/admin/categories
export async function POST(req: NextRequest) {
    if (!(await checkAdmin())) return unauthorizedResponse();

    try {
        const body = await req.json();
        const parsed = createCategorySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
        }

        let finalOrder = parsed.data.order;
        if (finalOrder === 0) {
            const maxCat = await prisma.category.findFirst({
                orderBy: { order: 'desc' },
                select: { order: true }
            });
            finalOrder = maxCat ? maxCat.order + 1 : 1;
        }

        const category = await prisma.category.create({
            data: {
                slug: parsed.data.slug,
                icon: parsed.data.icon,
                enabled: parsed.data.enabled,
                order: finalOrder,
                translations: {
                    create: parsed.data.translations.map((t: any) => ({
                        lang: t.lang,
                        name: t.name,
                    })),
                },
            },
            include: { translations: true, _count: { select: { features: true } } },
        });

        await invalidateFeatureCache();
        return NextResponse.json({ success: true, category });
    } catch (error: unknown) {
        const prismaError = error as { code?: string };
        if (prismaError.code === "P2002") return NextResponse.json({ error: "Category slug already exists" }, { status: 409 });
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}

// PUT /api/admin/categories
export async function PUT(req: NextRequest) {
    if (!(await checkAdmin())) return unauthorizedResponse();

    try {
        const body = await req.json();
        const parsed = updateCategorySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
        }

        const { id, slug, icon, order, enabled, translations } = parsed.data;

        const data: Record<string, unknown> = {};
        if (slug !== undefined) data.slug = slug;
        if (icon !== undefined) data.icon = icon;
        if (order !== undefined) data.order = order;
        if (enabled !== undefined) data.enabled = enabled;

        await prisma.category.update({ where: { id }, data });

        if (translations) {
            for (const t of translations) {
                await prisma.categoryTranslation.upsert({
                    where: { categoryId_lang: { categoryId: id, lang: t.lang } },
                    create: { categoryId: id, lang: t.lang, name: t.name },
                    update: { name: t.name },
                });
            }
        }

        const updated = await prisma.category.findUnique({
            where: { id },
            include: { translations: true, _count: { select: { features: true } } },
        });

        await invalidateFeatureCache();
        return NextResponse.json({ success: true, category: updated });
    } catch (error: unknown) {
        console.error("Update category error:", error);
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

// DELETE /api/admin/categories?id=xxx&force=true
export async function DELETE(req: NextRequest) {
    if (!(await checkAdmin())) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const force = searchParams.get("force") === "true";

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    // Check if category has features
    const featureCount = await prisma.feature.count({ where: { categoryId: id } });

    if (!force && featureCount > 0) {
        return NextResponse.json({
            error: "Cannot delete category with features. Move or delete features first.",
            hasFeatures: true,
            featureCount,
        }, { status: 400 });
    }

    try {
        if (force && featureCount > 0) {
            // Cascading delete via $transaction: deepest relations first
            // 1. Get all feature IDs belonging to this category
            const featureIds = (await prisma.feature.findMany({
                where: { categoryId: id },
                select: { id: true },
            })).map(f => f.id);

            await prisma.$transaction([
                // 2. Delete FeatureCommand records for all features
                prisma.featureCommand.deleteMany({
                    where: { featureId: { in: featureIds } },
                }),
                // 3. Delete FeatureTranslation records for all features
                prisma.featureTranslation.deleteMany({
                    where: { featureId: { in: featureIds } },
                }),
                // 4. Delete all Feature records
                prisma.feature.deleteMany({
                    where: { categoryId: id },
                }),
                // 5. Delete CategoryTranslation records
                prisma.categoryTranslation.deleteMany({
                    where: { categoryId: id },
                }),
                // 6. Finally delete the Category itself
                prisma.category.delete({ where: { id } }),
            ]);
        } else {
            // No features — safe to delete directly (translations cascade)
            await prisma.$transaction([
                prisma.categoryTranslation.deleteMany({
                    where: { categoryId: id },
                }),
                prisma.category.delete({ where: { id } }),
            ]);
        }

        await invalidateFeatureCache();
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Delete category error:", error);
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}
