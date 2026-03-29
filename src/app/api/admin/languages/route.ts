import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { languageService } from "@/lib/languageService";
import { auth } from "@/lib/auth";
import { z } from "zod";

// GET: Fetch all languages
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

const languageSchema = z.object({
    code: z.string().min(2).max(5).regex(/^[a-z]{2,5}$/),
    name: z.string().min(1).max(50),
    nativeName: z.string().min(1).max(50),
    turkishName: z.string().min(1).max(50).optional().default(""),
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
        const data = languageSchema.parse(body);

        const language = await prisma.$transaction(async (tx) => {
            if (data.isDefault) {
                await tx.language.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
                const { settingsService } = await import("@/lib/settingsService");
                await settingsService.updateSetting("default_lang", data.code, "string", "Varsayılan dil kodu");
            }

            return await tx.language.create({ 
                data: {
                    ...data,
                    seoMetadata: data.seoMetadata || { title: "", description: "", keywords: "" }
                } 
            });
        });

        await languageService.invalidateCache();
        return NextResponse.json(language, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create language" }, { status: 500 });
    }
}

// PUT: Bulk update (Task 5: Prisma Payload White-List)
export async function PUT(request: NextRequest) {
    const session = await auth();
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const { id, newCode, ...inputData } = body;

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const currentLang = await prisma.language.findUnique({ 
            where: { id },
            select: { isDefault: true, isActive: true, code: true }
        });

        if (!currentLang) return NextResponse.json({ error: "Language not found" }, { status: 404 });

        // PRISMA WHITE-LIST: Discard any UI-specific or non-schema fields
        const validFields = ["code", "name", "nativeName", "turkishName", "flagSvg", "utcOffset", "isActive", "isDefault", "sortOrder", "seoMetadata"];
        const updateData: any = {};
        
        validFields.forEach(field => {
            if (inputData[field] !== undefined) {
                updateData[field] = inputData[field];
            }
        });

        // Handle possible code rename via newCode
        if (newCode && newCode !== currentLang.code) {
            updateData.code = newCode;
        }

        // Logic Enforcement: Default language protection
        if (currentLang.isDefault) {
            if (updateData.isActive === false) {
                return NextResponse.json({ error: "Varsayılan dil pasife alınamaz. Önce başka bir dili varsayılan yapın." }, { status: 400 });
            }
            if (updateData.isDefault === false) {
                return NextResponse.json({ error: "Varsayılan dil durumu doğrudan kaldırılamaz. Lütfen başka bir dili varsayılan olarak seçin." }, { status: 400 });
            }
        }

        const updated = await prisma.$transaction(async (tx) => {
            if (updateData.isDefault) {
                await tx.language.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
                updateData.isActive = true; 
                const { settingsService } = await import("@/lib/settingsService");
                await settingsService.updateSetting("default_lang", updateData.code || currentLang.code, "string", "Varsayılan dil kodu");
            }

            return await tx.language.update({
                where: { id },
                data: updateData,
            });
        });

        await languageService.invalidateCache();
        return NextResponse.json(updated);
    } catch (error) {
        console.error("[Admin Languages PUT Error]", error);
        return NextResponse.json({ error: "Update failed; possible invalid payload structure." }, { status: 500 });
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
        await languageService.invalidateCache();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Admin Languages DELETE]", error);
        return NextResponse.json({ error: "Failed to delete language" }, { status: 500 });
    }
}
