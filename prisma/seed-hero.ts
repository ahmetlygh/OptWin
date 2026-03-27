import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedHeroTranslations() {
    const defaultVals = {
        en: { 
            "hero.titlePrefix": "", 
            "hero.titleHighlight": "Optimize", 
            "hero.titleSuffix": " your Windows Experience" 
        },
        tr: { 
            "hero.titlePrefix": "Windows Deneyiminizi ", 
            "hero.titleHighlight": "Hızlandırın", 
            "hero.titleSuffix": "" 
        },
        de: { 
            "hero.titlePrefix": "Ihr Windows-Erlebnis ", 
            "hero.titleHighlight": "Optimieren", 
            "hero.titleSuffix": "" 
        },
        fr: { 
            "hero.titlePrefix": "", 
            "hero.titleHighlight": "Optimisez", 
            "hero.titleSuffix": " votre expérience Windows" 
        },
        es: { 
            "hero.titlePrefix": "", 
            "hero.titleHighlight": "Optimiza", 
            "hero.titleSuffix": " tu experiencia Windows" 
        },
        zh: { 
            "hero.titlePrefix": "", 
            "hero.titleHighlight": "优化", 
            "hero.titleSuffix": " 您的 Windows 体验" 
        },
        hi: { 
            "hero.titlePrefix": "अपने Windows अनुभव को ", 
            "hero.titleHighlight": "अनुकूलित करें", 
            "hero.titleSuffix": "" 
        }
    };

    console.log("Starting DB seed for hero title struct...");
    for (const [lang, vars] of Object.entries(defaultVals)) {
        for (const [key, value] of Object.entries(vars)) {
            const dbKey = `optwin:setting:translations:${key}:${lang}`;
            await prisma.siteSetting.upsert({
                where: { key: dbKey },
                update: { value },
                create: { key: dbKey, value },
            });
            console.log(`Saved ${dbKey} => "${value}"`);
        }
    }
    
    console.log("Finished db seed. Flushing central translations redis cache aside...");
    // Let the redis cache be flushed naturally on next load or we can invoke the API
    await fetch("http://localhost:3000/api/admin/ui-translations", { method: "GET" }).catch(() => {});
    console.log("Done.");
}

seedHeroTranslations().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
