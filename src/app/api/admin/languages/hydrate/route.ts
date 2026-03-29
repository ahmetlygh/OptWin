import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { languageService } from "@/lib/languageService";

// POST: Hydrate all languages to 100% completion
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // 1. Get all languages
        const languages = await prisma.language.findMany();
        const defaultLang = languages.find(l => l.isDefault) || languages[0];

        if (!defaultLang) return NextResponse.json({ error: "No default language found" }, { status: 400 });

        const defTrans = (defaultLang.translations as Record<string, string>) || {};
        const defSeo = (defaultLang.seoMetadata as any) || {};

        const results = [];

        // 2. Iterate through each language
        for (const lang of languages) {
            if (lang.isDefault) continue;

            const currentTrans = (lang.translations as Record<string, string>) || {};
            const currentSeo = (lang.seoMetadata as any) || {};

            let updatedTrans = { ...currentTrans };
            let updatedSeo = { ...currentSeo };
            let changes = 0;

            // Deep merge missing translations
            Object.keys(defTrans).forEach(key => {
                if (updatedTrans[key] === undefined || updatedTrans[key] === null || updatedTrans[key] === "") {
                    updatedTrans[key] = defTrans[key];
                    changes++;
                }
            });

            // Deep merge missing SEO
            const seoKeys = ["title", "description", "keywords"] as const;
            seoKeys.forEach(key => {
                if (!updatedSeo[key]) {
                    updatedSeo[key] = defSeo[key] || "";
                    changes++;
                }
            });

            if (changes > 0) {
                await prisma.language.update({
                    where: { id: lang.id },
                    data: {
                        translations: updatedTrans,
                        seoMetadata: updatedSeo
                    }
                });
                results.push({ code: lang.code, changes });
            }
        }

        await languageService.invalidateCache();

        return NextResponse.json({ 
            success: true, 
            message: "Database hydration completed successfully.",
            details: results
        });
    } catch (error) {
        console.error("[Hydration Error]", error);
        return NextResponse.json({ error: "Hydration failed", details: (error as Error).message }, { status: 500 });
    }
}
