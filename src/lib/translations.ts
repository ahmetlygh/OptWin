import { prisma } from "@/lib/db";
import { redisCache } from "./redis";

/**
 * Fetches translations from the database with Redis caching.
 * Follows the same Cache-Aside pattern as settingsService.
 */
export async function getTranslationsFromDb(lang: string): Promise<Record<string, string>> {
    const cacheKey = `optwin:translations:${lang}`;
    const start = performance.now();

    try {
        // 1. Try Redis first
        const cached = await redisCache.get(cacheKey);
        if (cached !== null) {
            const time = (performance.now() - start).toFixed(2);
            console.log(`[Translations] Fetching '${lang}' from Redis - Time: ${time}ms`);
            return JSON.parse(cached);
        }

        // 2. Redis miss, fetch from DB
        const [langRows, enRows] = await Promise.all([
            prisma.uiTranslation.findMany({ 
                where: { lang }, 
                select: { key: true, value: true } 
            }),
            lang !== "en"
                ? prisma.uiTranslation.findMany({ 
                    where: { lang: "en" }, 
                    select: { key: true, value: true } 
                })
                : Promise.resolve([]),
        ]);

        const result: Record<string, string> = {};
        // Fallback: Populate with 'en' first, then override with target 'lang'
        for (const row of enRows) result[row.key] = row.value;
        for (const row of langRows) result[row.key] = row.value;

        // 3. Store in Redis
        await redisCache.set(cacheKey, JSON.stringify(result), 86400); // 24H TTL
        
        const time = (performance.now() - start).toFixed(2);
        console.log(`[Translations] Fetching '${lang}' from DB - Time: ${time}ms`);
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
        // To purge all translations, we would need to scan or use a pattern.
        // For simplicity, we'll delete common languages or assume bulk delete if needed.
        const langs = ["en", "tr", "de", "fr", "es", "zh", "hi"];
        const keys = langs.map(l => `optwin:translations:${l}`);
        await redisCache.del(keys);
    }
}
