import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

async function seedHeroInterpolation() {
    console.log("Starting linguistic mapping for 7 languages...");

    const mappings = {
        tr: { template: "{prefix} {highlight}", highlight: "Hızlandırın", prefix: "Windows Deneyiminizi" },
        en: { template: "{highlight} {prefix}", highlight: "Optimize", prefix: "your Windows Experience" },
        de: { template: "{highlight} {prefix}", highlight: "Optimieren", prefix: "Sie Ihr Windows-Erlebnis" },
        fr: { template: "{highlight} {prefix}", highlight: "Optimisez", prefix: "votre expérience Windows" },
        es: { template: "{highlight} {prefix}", highlight: "Optimice", prefix: "su experiencia con Windows" },
        zh: { template: "{highlight}{prefix}", highlight: "优化", prefix: "您的 Windows 体验" },
        hi: { template: "{prefix} {highlight}", highlight: "अनुकूलित करें", prefix: "अपने Windows अनुभव को" }
    };

    for (const [lang, vars] of Object.entries(mappings)) {
        // Map dynamic keys to DB
        const keysToUpsert = {
            "hero.titleTemplate": vars.template,
            "hero.titleHighlight": vars.highlight,
            "hero.titlePrefix": vars.prefix
        };

        for (const [key, value] of Object.entries(keysToUpsert)) {
            const dbKey = `optwin:setting:translations:${key}:${lang}`;
            await prisma.siteSetting.upsert({
                where: { key: dbKey },
                update: { value },
                create: { key: dbKey, value, type: "string" },
            });
            console.log(`[DB] UPSERT => ${dbKey} = "${value}"`);
        }

        // Wipe old suffixes completely to prevent ghost rendering
        const suffixKey = `optwin:setting:translations:hero.titleSuffix:${lang}`;
        try {
            await prisma.siteSetting.delete({ where: { key: suffixKey } });
            console.log(`[DB] PURGED old key => ${suffixKey}`);
        } catch { } // Ignore if not exist
    }

    console.log("Flushing all Redis site settings namespaces matching translation structure...");
    try {
        const keys = await redis.keys("optwin:setting:*");
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`[REDIS] Flushed ${keys.length} cached translation/settings keys.`);
        } else {
            console.log("[REDIS] Cache is already void.");
        }
    } catch (e) {
        console.warn("[REDIS ERROR] Ensure Redis is running if necessary via Coolify/Local.", e);
    }

    console.log("DB and Cache fully synchronized.");
}

seedHeroInterpolation().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
    redis.quit();
});
