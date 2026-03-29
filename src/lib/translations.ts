import { prisma } from "@/lib/db";
import { redisCache } from "./redis";

/**
 * Fetches translations from the database with Redis caching.
 * Pulls from the Language.translations JSONB field.
 */
export async function getTranslationsFromDb(lang: string): Promise<Record<string, string>> {
    const cacheKey = `optwin:translations:${lang}`;
    const start = performance.now();

    try {
        // 1. Try Redis first
        const cached = await redisCache.get(cacheKey);
        if (cached !== null) {
            const time = (performance.now() - start).toFixed(2);
            // console.log(`[Translations] Fetching '${lang}' from Redis - Time: ${time}ms`);
            return JSON.parse(cached);
        }

        // 2. Redis miss, fetch from DB
        const [langData, enData] = await Promise.all([
            prisma.language.findUnique({ 
                where: { code: lang }, 
                // @ts-ignore
            select: { translations: true } 
            }),
            lang !== "en"
                ? prisma.language.findUnique({ 
                    where: { code: "en" }, 
                    // @ts-ignore
            select: { translations: true } 
                })
                : Promise.resolve(null),
        ]);

        const enTranslations = ((enData as any)?.translations as Record<string, string>) || {};
        const langTranslations = ((langData as any)?.translations as Record<string, string>) || {};

        const result: Record<string, string> = { ...enTranslations, ...langTranslations };

        // 3. Store in Redis
        await redisCache.set(cacheKey, JSON.stringify(result), 86400); // 24H TTL
        
        const time = (performance.now() - start).toFixed(2);
        // console.log(`[Translations] Fetching '${lang}' from DB - Time: ${time}ms`);
        return result;
    } catch (error) {
        console.error(`[TranslationsService] getTranslationsFromDb error for lang: ${lang}`, error);
        return {};
    }
}

/**
 * Purges the translation cache for a specific language or all languages.
 */
export async function purgeTranslationCache(lang?: string) {
    if (lang) {
        await redisCache.del(`optwin:translations:${lang}`);
    } else {
        try {
            const langs = await prisma.language.findMany({ select: { code: true } });
            const keys = langs.map((l: { code: string }) => `optwin:translations:${l.code}`);
            if (keys.length > 0) {
                await redisCache.del(keys);
            }
        } catch {
            const defaultLangs = ["en", "tr", "de", "fr", "es", "zh", "hi"];
            const keys = defaultLangs.map((l: string) => `optwin:translations:${l}`);
            await redisCache.del(keys);
        }
    }
}
