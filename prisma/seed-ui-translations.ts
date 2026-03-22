/**
 * Seed script: Converts ALL i18n locale files into UiTranslation DB rows.
 * Run with: npx tsx prisma/seed-ui-translations.ts
 * 
 * This ensures the UiTranslation table contains ALL translation keys
 * from the static locale files. Admin panel can then override any key.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Import all locale files
import en from "../src/i18n/locales/en";
import tr from "../src/i18n/locales/tr";
import de from "../src/i18n/locales/de";
import fr from "../src/i18n/locales/fr";
import es from "../src/i18n/locales/es";
import zh from "../src/i18n/locales/zh";
import hi from "../src/i18n/locales/hi";

const locales: Record<string, Record<string, string>> = {
    en: en as unknown as Record<string, string>,
    tr: tr as unknown as Record<string, string>,
    de: de as unknown as Record<string, string>,
    fr: fr as unknown as Record<string, string>,
    es: es as unknown as Record<string, string>,
    zh: zh as unknown as Record<string, string>,
    hi: hi as unknown as Record<string, string>,
};

async function seedUiTranslations() {
    console.log("🌍 Seeding UI translations from locale files...\n");

    let count = 0;

    for (const [lang, translations] of Object.entries(locales)) {
        const keys = Object.keys(translations);
        console.log(`  📝 ${lang.toUpperCase()}: ${keys.length} keys`);

        for (const key of keys) {
            const value = translations[key];
            if (!value) continue;

            await prisma.uiTranslation.upsert({
                where: { key_lang: { key, lang } },
                update: { value },
                create: { key, lang, value },
            });
            count++;
        }
    }

    console.log(`\n  ✅ ${count} UI translation rows seeded.\n`);
}

async function main() {
    await seedUiTranslations();
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
