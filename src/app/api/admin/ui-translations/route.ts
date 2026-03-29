import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { checkAdmin, unauthorizedResponse } from "@/lib/admin-guard";
import { purgeTranslationCache } from "@/lib/translations";
import { z } from "zod";

/**
 * GET /api/admin/ui-translations?lang=xx
 * Returns all UI translations for the given language (admin only).
 * If no lang, returns all translations grouped by lang.
 */
export async function GET(req: NextRequest) {
    if (!(await checkAdmin())) return unauthorizedResponse();

    const lang = req.nextUrl.searchParams.get("lang");
    const prefix = req.nextUrl.searchParams.get("prefix"); // e.g. "about." to filter keys

    try {
        const where: Record<string, unknown> = {};
        if (lang) where.lang = lang;
        if (prefix) where.key = { startsWith: prefix };

        const rows = await prisma.language.findMany({
            // @ts-ignore
            select: { code: true, translations: true }
        });

        // Group by lang
        const grouped: Record<string, Record<string, string>> = {};
        for (const row of rows) {
            // @ts-ignore
            grouped[row.code] = (row.translations as Record<string, string>) || {};
        }

        // If specific lang requested, filter
        if (lang && grouped[lang]) {
             const filtered: Record<string, Record<string, string>> = { [lang]: grouped[lang] };
             return NextResponse.json({ success: true, translations: filtered });
        }

        return NextResponse.json({ success: true, translations: grouped });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, error: "Failed to fetch translations" }, { status: 500 });
    }
}

const upsertSchema = z.object({
    translations: z.array(z.object({
        key: z.string().min(1).max(200),
        lang: z.string().min(2).max(5),
        value: z.string(),
    })).min(1).max(500),
});

/**
 * PUT /api/admin/ui-translations
 * Bulk upsert UI translations.
 * Body: { translations: [{ key, lang, value }, ...] }
 */
export async function PUT(req: NextRequest) {
    if (!(await checkAdmin())) return unauthorizedResponse();

    try {
        const body = await req.json();
        const parsed = upsertSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }

        // Group changes by language
        const langChanges: Record<string, Record<string, string>> = {};
        for (const t of parsed.data.translations) {
            if (!langChanges[t.lang]) langChanges[t.lang] = {};
            langChanges[t.lang][t.key] = t.value;
        }

        const codes = Object.keys(langChanges);
        
        const currentLangs = await prisma.language.findMany({
            where: { code: { in: codes } },
            // @ts-ignore
            select: { code: true, translations: true }
        });

        const ops = [];
        for (const langObj of currentLangs) {
             const code = langObj.code;
             // @ts-ignore
             const originalObj = (langObj.translations as Record<string, string>) || {};
             const merged = { ...originalObj, ...langChanges[code] };
             
             ops.push(prisma.language.update({
                 where: { code },
                 // @ts-ignore
                 data: { translations: merged }
             }));
        }

        await prisma.$transaction(ops);
        
        // Purge Redis cache for UI translations
        for (const code of codes) {
            await purgeTranslationCache(code);
        }
        
        // Also invalidate language service
        const { languageService } = await import("@/lib/languageService");
        await languageService.invalidateCache();

        revalidateTag("ui-translations", "layout" as any);
        revalidatePath("/", "layout");

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("UI translations update error:", error);
        return NextResponse.json({ success: false, error: "Failed to update translations" }, { status: 500 });
    }
}
