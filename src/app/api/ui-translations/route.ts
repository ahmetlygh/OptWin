import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

/**
 * GET /api/ui-translations?lang=xx
 * Returns all UI translations for the given language.
 * Falls back to English for missing keys.
 */

const getTranslationsFromDb = unstable_cache(
    async (lang: string) => {
        // Fetch requested language + English fallback in parallel
        const [langRows, enRows] = await Promise.all([
            prisma.uiTranslation.findMany({ where: { lang }, select: { key: true, value: true } }),
            lang !== "en"
                ? prisma.uiTranslation.findMany({ where: { lang: "en" }, select: { key: true, value: true } })
                : Promise.resolve([]),
        ]);

        // Build EN fallback map, then override with target lang
        const result: Record<string, string> = {};
        for (const row of enRows) result[row.key] = row.value;
        for (const row of langRows) result[row.key] = row.value;
        return result;
    },
    ["ui-translations"],
    { revalidate: 60, tags: ["ui-translations"] }
);

export async function GET(req: NextRequest) {
    const lang = req.nextUrl.searchParams.get("lang") || "en";
    try {
        const translations = await getTranslationsFromDb(lang);
        return NextResponse.json(translations, {
            headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
        });
    } catch {
        return NextResponse.json({}, { status: 500 });
    }
}
