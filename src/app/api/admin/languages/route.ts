import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { languageService } from "@/lib/languageService";
import { auth } from "@/lib/auth";
import { z } from "zod";

// GET: Fetch all languages (admin view includes inactive)
export async function GET() {
    const session = await auth();
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const languages = await prisma.language.findMany({
            orderBy: { sortOrder: "asc" },
        });
        return NextResponse.json(languages);
    } catch (error) {
        console.error("[Admin Languages GET]", error);
        return NextResponse.json({ error: "Failed to fetch languages" }, { status: 500 });
    }
}

const createSchema = z.object({
    code: z.string().min(2).max(5).regex(/^[a-z]{2,5}$/),
    name: z.string().min(1).max(50),
    nativeName: z.string().min(1).max(50),
    flagSvg: z.string().max(10000).default(""),
    utcOffset: z.number().min(-12).max(14).default(0),
    isActive: z.boolean().default(true),
    isDefault: z.boolean().default(false),
    sortOrder: z.number().int().default(0),
    seoMetadata: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.string().optional(),
    }).nullable().optional(),
});

// POST: Create a new language
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const data = createSchema.parse(body);

        // If setting as default, unset all others
        if (data.isDefault) {
            await prisma.language.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
        }

        const language = await prisma.language.create({ data });

        // Log event
        await prisma.systemEvent.create({
            data: {
                action: "CREATE_LANGUAGE",
                entityType: "language",
                entityId: language.id,
                metadata: { code: language.code },
                adminEmail: session.user?.email || null,
            },
        });

        // Invalidate cache
        await languageService.invalidateCache();

        return NextResponse.json(language, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
        }
        console.error("[Admin Languages POST]", error);
        return NextResponse.json({ error: "Failed to create language" }, { status: 500 });
    }
}

// PUT: Bulk update (reorder, toggle active)
export async function PUT(request: NextRequest) {
    const session = await auth();
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        // If setting as default, unset all others
        if (updateData.isDefault) {
            await prisma.language.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
        }

        const updated = await prisma.language.update({
            where: { id },
            data: updateData,
        });

        // Log event
        await prisma.systemEvent.create({
            data: {
                action: "UPDATE_LANGUAGE",
                entityType: "language",
                entityId: updated.id,
                metadata: { code: updated.code, fields: Object.keys(updateData) },
                adminEmail: session.user?.email || null,
            },
        });

        await languageService.invalidateCache();

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[Admin Languages PUT]", error);
        return NextResponse.json({ error: "Failed to update language" }, { status: 500 });
    }
}

// DELETE: Remove a language
export async function DELETE(request: NextRequest) {
    const session = await auth();
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const lang = await prisma.language.findUnique({ where: { id } });
        if (!lang) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (lang.isDefault) return NextResponse.json({ error: "Cannot delete the default language" }, { status: 400 });

        await prisma.language.delete({ where: { id } });

        // Log event
        await prisma.systemEvent.create({
            data: {
                action: "DELETE_LANGUAGE",
                entityType: "language",
                entityId: id,
                metadata: { code: lang.code },
                adminEmail: session.user?.email || null,
            },
        });

        await languageService.invalidateCache();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Admin Languages DELETE]", error);
        return NextResponse.json({ error: "Failed to delete language" }, { status: 500 });
    }
}
