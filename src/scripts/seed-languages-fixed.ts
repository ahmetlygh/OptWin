import { PrismaClient } from "@prisma/client";
import { defaultLanguages } from "../../prisma/seed-data/languages";
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding languages and migrating translations...");
    
    // 1. Seed Languages
    for (const lang of defaultLanguages) {
        await prisma.language.upsert({
            where: { code: lang.code },
            update: { 
                name: lang.code === 'tr' ? 'Turkish' : lang.name,
                nativeName: lang.nativeName,
                flagSvg: lang.flagSvg,
                utcOffset: lang.utcOffset,
                isDefault: lang.isDefault,
                isActive: lang.isActive,
                sortOrder: lang.sortOrder,
                seoMetadata: lang.seoMetadata
            },
            create: lang,
        });
    }

    // 2. Migrate UI Translations
    const allTrans = await prisma.uiTranslation.findMany();
    const map: Record<string, Record<string, string>> = {};
    for (const t of allTrans) {
        if (!map[t.lang]) map[t.lang] = {};
        map[t.lang][t.key] = t.value;
    }

    for (const [lang, translations] of Object.entries(map)) {
        console.log(`Updating ${lang} translations (Keys: ${Object.keys(translations).length})`);
        await prisma.language.update({
            where: { code: lang },
            data: { translations }
        });
    }

    console.log("Complete!");
}

main().finally(() => prisma.$disconnect());
