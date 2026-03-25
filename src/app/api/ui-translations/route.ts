import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

/**
 * GET /api/ui-translations?lang=xx
 * Returns all UI translations for the given language.
 * Falls back to English for missing keys.
 */

import { getTranslationsFromDb } from "@/lib/translations";

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
