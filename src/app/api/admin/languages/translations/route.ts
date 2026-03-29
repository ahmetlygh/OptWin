import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { languageService } from "@/lib/languageService";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    try {
        const lang = await prisma.language.findUnique({
            where: { code },
            // @ts-ignore - translations exists in schema but Prisma Client may be cached
            select: { translations: true, seoMetadata: true, code: true, name: true }
        });
        if (!lang) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json(lang);
    } catch (error) {
        console.error("[Translations GET]", error);
        return NextResponse.json({ error: "Failed to fetch translations" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const session = await auth();
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const { code, translations, seoMetadata } = body;

        if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

        const updated = await prisma.language.update({
            where: { code },
            data: { 
                // @ts-ignore
                ...(translations !== undefined && { translations }),
                ...(seoMetadata !== undefined && { seoMetadata })
            },
        });

        // Log event
        await prisma.systemEvent.create({
            data: {
                action: "UPDATE_TRANSLATIONS",
                entityType: "language",
                entityId: updated.id,
                metadata: { code, updatedKeys: translations ? Object.keys(translations).length : 0 },
                adminEmail: session.user?.email || null,
            },
        });

        // Clear redis cache
        await languageService.invalidateCache();
        import("@/lib/translations").then(c => c.purgeTranslationCache(code));

        return NextResponse.json({ success: true, updated: updated.code });
    } catch (error) {
        console.error("[Translations PUT]", error);
        return NextResponse.json({ error: "Failed to update translations" }, { status: 500 });
    }
}
