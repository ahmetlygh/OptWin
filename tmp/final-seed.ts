import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function finalSeeding() {
    console.log("--- OptWin Final SEO Hydration ---");
    const languages = await prisma.language.findMany();
    
    for (const lang of languages) {
        let trans = lang.translations as Record<string, string> || {};
        let seo = lang.seoMetadata as any || {};
        
        let changed = false;
        
        // Populate translations with SEO keys if missing
        if (!trans["seo.title"] && seo.title) { trans["seo.title"] = seo.title; changed = true; }
        if (!trans["seo.description"] && seo.description) { trans["seo.description"] = seo.description; changed = true; }
        if (!trans["seo.keywords"] && seo.keywords) { trans["seo.keywords"] = seo.keywords; changed = true; }

        if (changed) {
            await prisma.language.update({
                where: { id: lang.id },
                data: { translations: trans }
            });
            console.log(`Updated translations for ${lang.code} with SEO metadata.`);
        }
    }
    console.log("Final Seeding Complete.");
}

finalSeeding().finally(() => prisma.$disconnect());
