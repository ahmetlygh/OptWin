import { prisma } from "@/lib/db";
import { redisCache } from "./redis";

import { z } from "zod";

const LOCAL_CACHE_TTL_MS = 60 * 1000; // 1 dakika
const globalForTranslations = global as unknown as { translationsLocalCache: Map<string, { value: any; expiresAt: number }> };
const localCache = globalForTranslations.translationsLocalCache || new Map<string, { value: any; expiresAt: number }>();
if (process.env.NODE_ENV !== "production") globalForTranslations.translationsLocalCache = localCache;

// Schema for Runtime Types
const TranslationsSchema = z.record(z.string(), z.string());

// TTY check: Next.js console.log'u yakalayıp tarayıcıya forward eder.
// Renkli çıktı sadece process.stdout.write ile doğrudan TTY'ye yazılır.
const isTTY = typeof process !== 'undefined' && process.stdout && process.stdout.isTTY === true;

// Dinamik Milisaniye Renklendirme (sadece TTY modunda kullanılır)
const getMsColor = (ms: number) => {
    if (ms < 2) return '\x1b[32m';
    if (ms < 100) return '\x1b[33m';
    if (ms < 400) return '\x1b[38;5;208m';
    return '\x1b[31m';
};

const logPerformance = (module: string, source: "Memory" | "Redis" | "DB", lang: string, ms: string, keys?: string[]) => {
    const sourcePad = source.padEnd(6, ' ');
    let display = lang;
    if (process.env.DEBUG_SETTINGS === 'true' && keys && keys.length > 0) {
        display = keys.join(', ');
    }
    const plainMsg = `[${module}] ${sourcePad} | ${display} - ${ms}ms`;

    if (isTTY) {
        const numMs = parseFloat(ms);
        const color = getMsColor(numMs);
        process.stdout.write(`${plainMsg.replace(`${ms}ms`, `${color}${ms}ms\x1b[0m`)}\n`);
    } else {
        console.log(plainMsg);
    }
};

/**
 * Fetches translations from the database with Memory & Redis caching.
 * Pulls from the Language.translations JSONB field.
 */
export async function getTranslationsFromDb(lang: string): Promise<Record<string, string>> {
    const memoryKey = `lang_${lang}`;
    const cacheKey = `optwin:translations:${lang}`;
    const start = performance.now();
    const now = Date.now();

    // 1. In-Memory Cache (L1) with SWR
    const cachedLocal = localCache.get(memoryKey);
    if (cachedLocal) {
        if (now > cachedLocal.expiresAt) {
            // SWR: Arka planda tazele
            _fetchTranslations(lang, cacheKey, memoryKey, start).catch(e => console.error("Translations SWR error:", e));
        }
        logPerformance('Translations', 'Memory', lang, (performance.now() - start).toFixed(2), Object.keys(cachedLocal.value));
        return cachedLocal.value;
    }

    // 2. Fallback to Redis / DB
    return await _fetchTranslations(lang, cacheKey, memoryKey, start);
}

// Interal worker
async function _fetchTranslations(lang: string, cacheKey: string, memoryKey: string, startParam?: number): Promise<Record<string, string>> {
    const start = startParam || performance.now();
    try {
        const cached = await redisCache.get(cacheKey);
        if (cached !== null) {
            let parsed = JSON.parse(cached);
            try { parsed = TranslationsSchema.parse(parsed); } catch { /* silent fallback */ }
            localCache.set(memoryKey, { value: parsed, expiresAt: Date.now() + LOCAL_CACHE_TTL_MS });
            logPerformance('Translations', 'Redis', lang, (performance.now() - start).toFixed(2), Object.keys(parsed));
            return parsed;
        }

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

        let result: Record<string, string> = { ...enTranslations, ...langTranslations };
        try { result = TranslationsSchema.parse(result); } catch { /* sil fallback */ }

        await redisCache.set(cacheKey, JSON.stringify(result), 86400); // 24H TTL
        localCache.set(memoryKey, { value: result, expiresAt: Date.now() + LOCAL_CACHE_TTL_MS });
        
        logPerformance('Translations', 'DB', lang, (performance.now() - start).toFixed(2), Object.keys(result));
        return result;
    } catch (error) {
        console.error(`[TranslationsService] fetch error for lang: ${lang}`, error);
        return {};
    }
}

/**
 * Purges the translation cache for a specific language or all languages.
 */
export async function purgeTranslationCache(lang?: string) {
    if (lang) {
        await redisCache.del(`optwin:translations:${lang}`);
        localCache.delete(`lang_${lang}`);
    } else {
        try {
            const langs = await prisma.language.findMany({ select: { code: true } });
            const keys = langs.map(l => `optwin:translations:${l.code}`);
            if (keys.length > 0) {
                await redisCache.del(keys);
            }
            langs.forEach(l => localCache.delete(`lang_${l.code}`));
        } catch {
            const defaultLangs = ["en", "tr", "de", "fr", "es", "zh", "hi"];
            const keys = defaultLangs.map(l => `optwin:translations:${l}`);
            await redisCache.del(keys);
            defaultLangs.forEach(l => localCache.delete(`lang_${l}`));
        }
    }
}
