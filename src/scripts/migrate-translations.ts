import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    console.log("Migrating UI translations to Language.translations...");
    
    // Group all translations by language
    const allTrans = await prisma.uiTranslation.findMany();
    const map: Record<string, Record<string, string>> = {};
    
    for (const t of allTrans) {
        if (!map[t.lang]) map[t.lang] = {};
        map[t.lang][t.key] = t.value;
    }

    for (const [lang, translations] of Object.entries(map)) {
        console.log(`Updating ${lang} with ${Object.keys(translations).length} keys`);
        try {
            await prisma.language.update({
                where: { code: lang },
                // @ts-ignore
                data: { translations }
            });
        } catch (e) {
            console.error(`Language ${lang} not found, skipping.`);
        }
    }
    console.log("Done!");
}

main().finally(() => prisma.$disconnect());
