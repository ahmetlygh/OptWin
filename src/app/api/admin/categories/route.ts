import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

async function checkAdmin() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || !(session as any).isAdmin) return false;
    return true;
}

// GET /api/admin/categories
export async function GET() {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { slug, icon, order, enabled, translations } = body;

        if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });

        const category = await prisma.category.create({
            data: {
                slug,
                icon: icon || null,
                order: order || 0,
                enabled: enabled !== false,
                translations: {
                    create: (translations || []).map((t: any) => ({
                        lang: t.lang,
                        name: t.name,
                    })),
                },
            },
            include: { translations: true, _count: { select: { features: true } } },
        });

        return NextResponse.json({ success: true, category });
    } catch (error: any) {
        if (error.code === "P2002") return NextResponse.json({ error: "Category slug already exists" }, { status: 409 });
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}

// PUT /api/admin/categories
export async function PUT(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { id, slug, icon, order, enabled, translations } = body;

        if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

        const data: any = {};
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

        return NextResponse.json({ success: true, category: updated });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

// DELETE /api/admin/categories?id=xxx
export async function DELETE(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    // Check if category has features
    const count = await prisma.feature.count({ where: { categoryId: id } });
    if (count > 0) {
        return NextResponse.json({ error: "Cannot delete category with features. Move or delete features first." }, { status: 400 });
    }

    try {
        await prisma.category.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}
