import { prisma } from "./db";
import { redisCache } from "./redis";

const CACHE_KEY = "optwin:languages:active";
const ALL_CACHE_KEY = "optwin:languages:all";
const TTL = 86400; // 24 hours

export interface LanguageData {
    code: string;
    name: string;
    nativeName: string;
    flagSvg: string;
    utcOffset: number;
    isActive: boolean;
    isDefault: boolean;
    sortOrder: number;
    seoMetadata: Record<string, string> | null;
}

export const languageService = {
    /**
     * Get all ACTIVE languages. Redis-first with DB fallback.
     * This is the primary method used by all public-facing components.
     */
    async getActiveLanguages(): Promise<LanguageData[]> {
        try {
            // 1. Redis
            const cached = await redisCache.get(CACHE_KEY);
            if (cached) {
                return JSON.parse(cached) as LanguageData[];
            }

            // 2. DB fallback
            const languages = await prisma.language.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: "asc" },
            });

            const data: LanguageData[] = languages.map(l => ({
                code: l.code,
                name: l.name,
                nativeName: l.nativeName,
                flagSvg: l.flagSvg,
                utcOffset: l.utcOffset,
                isActive: l.isActive,
                isDefault: l.isDefault,
                sortOrder: l.sortOrder,
                seoMetadata: l.seoMetadata as Record<string, string> | null,
            }));

            // Cache to Redis
            await redisCache.set(CACHE_KEY, JSON.stringify(data), TTL);
            return data;
        } catch (error) {
            console.error("[LanguageService] getActiveLanguages error:", error);
            // Hard fallback: return minimal defaults
            return [
                { code: "en", name: "English", nativeName: "English", flagSvg: "", utcOffset: 0, isActive: true, isDefault: true, sortOrder: 0, seoMetadata: null },
                { code: "tr", name: "Turkish", nativeName: "Türkçe", flagSvg: "", utcOffset: 3, isActive: true, isDefault: false, sortOrder: 1, seoMetadata: null },
            ];
        }
    },

    /**
     * Get ALL languages (including inactive). For admin panel only.
     */
    async getAllLanguages(): Promise<LanguageData[]> {
        try {
            const cached = await redisCache.get(ALL_CACHE_KEY);
            if (cached) return JSON.parse(cached) as LanguageData[];

            const languages = await prisma.language.findMany({
                orderBy: { sortOrder: "asc" },
            });

            const data: LanguageData[] = languages.map(l => ({
                code: l.code,
                name: l.name,
                nativeName: l.nativeName,
                flagSvg: l.flagSvg,
                utcOffset: l.utcOffset,
                isActive: l.isActive,
                isDefault: l.isDefault,
                sortOrder: l.sortOrder,
                seoMetadata: l.seoMetadata as Record<string, string> | null,
            }));

            await redisCache.set(ALL_CACHE_KEY, JSON.stringify(data), TTL);
            return data;
        } catch (error) {
            console.error("[LanguageService] getAllLanguages error:", error);
            return [];
        }
    },

    /**
     * Get just the active language codes. Used by middleware/proxy.
     */
    async getActiveCodes(): Promise<string[]> {
        const langs = await this.getActiveLanguages();
        return langs.map(l => l.code);
    },

    /**
     * Get UTC offset for a locale. Used by MaintenanceUI and script-generator.
     */
    async getUtcOffset(code: string): Promise<number> {
        const langs = await this.getActiveLanguages();
        return langs.find(l => l.code === code)?.utcOffset ?? 0;
    },

    /**
     * Invalidate all language caches. Called after admin updates.
     */
    async invalidateCache(): Promise<void> {
        await redisCache.del([CACHE_KEY, ALL_CACHE_KEY]);
    },
};
