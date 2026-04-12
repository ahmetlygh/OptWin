import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const pingTestTranslations: Record<string, string> = {
    tr: "Ping Testi Dosyası (İndir)",
    en: "Download Ping Test",
    de: "Ping-Test Herunterladen",
    es: "Descargar Prueba de Ping",
    fr: "Télécharger Test de Ping",
    zh: "下载 Ping 测试",
    hi: "पिंग टेस्ट डाउनलोड करें"
};

async function main() {
    console.log("Updating ping test translations in DB...");
    const langs = await prisma.language.findMany();
    
    for (const lang of langs) {
        const trans = lang.translations as Record<string, string> || {};
        const pText = pingTestTranslations[lang.code] || pingTestTranslations["en"];
        trans["dns.pingTest"] = pText;
        
        await prisma.language.update({
            where: { code: lang.code },
            data: { translations: trans }
        });
        console.log(`✅ Updated ${lang.code} with: ${pText}`);
    }
    
    console.log("Done updating DB!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
