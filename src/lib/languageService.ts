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
    translations?: Record<string, string>;
}

export const languageService = {
    /**
     * Get all ACTIVE languages.
     * Task 3: Ghost Language Protection - Fallback to default if translations are missing.
     */
    async getActiveLanguages(): Promise<LanguageData[]> {
        try {
            const cached = await redisCache.get(CACHE_KEY);
            if (cached) return JSON.parse(cached) as LanguageData[];

            const languages = await prisma.language.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: "asc" },
            });

            // Fetch default translations for fallback
            const defaultLang = languages.find(l => l.isDefault) || languages[0];
            const defTrans = defaultLang?.translations as Record<string, string> || {};

            const data: LanguageData[] = languages.map(l => {
                const trans = l.translations as Record<string, string> || {};
                
                // Task 3: If translations exist but are basically empty (not counting seo keys), fallback.
                const hasRealTrans = Object.keys(trans).some(k => !k.startsWith("seo.") && trans[k]);
                const finalTrans = hasRealTrans ? trans : { ...defTrans, ...trans };

                return {
                    code: l.code,
                    name: l.name,
                    nativeName: l.nativeName,
                    flagSvg: l.flagSvg,
                    utcOffset: l.utcOffset,
                    isActive: l.isActive,
                    isDefault: l.isDefault,
                    sortOrder: l.sortOrder,
                    seoMetadata: l.seoMetadata as Record<string, string> | null,
                    translations: finalTrans
                };
            });

            await redisCache.set(CACHE_KEY, JSON.stringify(data), TTL);
            return data;
        } catch (error) {
            console.error("[LanguageService] getActiveLanguages error:", error);
            return [];
        }
    },

    /**
     * Task 2: Automated SEO Synchronization
     * Ensures seoMetadata column and translations JSONB are perfectly synced.
     */
    async syncSeoData(langCode: string, seo?: { title?: string, description?: string, keywords?: string }): Promise<void> {
        const lang = await prisma.language.findUnique({ where: { code: langCode } });
        if (!lang) return;

        const currentSeo = (lang.seoMetadata as any) || {};
        const newSeo = { ...currentSeo, ...(seo || {}) };
        
        const trans = (lang.translations as Record<string, string>) || {};
        
        // Push SEO fields into translations for 100% completion metrics
        if (newSeo.title) trans["seo.title"] = newSeo.title;
        if (newSeo.description) trans["seo.description"] = newSeo.description;
        if (newSeo.keywords) trans["seo.keywords"] = newSeo.keywords;

        // Atomic update to both fields
        await prisma.language.update({
            where: { id: lang.id },
            data: {
                seoMetadata: newSeo,
                translations: trans
            }
        });

        await this.invalidateCache();
    },

    async getAllLanguages(): Promise<LanguageData[]> {
        try {
            const cached = await redisCache.get(ALL_CACHE_KEY);
            if (cached) return JSON.parse(cached) as LanguageData[];

            const languages = await prisma.language.findMany({ orderBy: { sortOrder: "asc" } });
            const data: LanguageData[] = languages.map(l => ({
                code: l.code, name: l.name, nativeName: l.nativeName, flagSvg: l.flagSvg, utcOffset: l.utcOffset, isActive: l.isActive, isDefault: l.isDefault, sortOrder: l.sortOrder, seoMetadata: l.seoMetadata as Record<string, string> | null
            }));

            await redisCache.set(ALL_CACHE_KEY, JSON.stringify(data), TTL);
            return data;
        } catch { return []; }
    },

    async getActiveCodes(): Promise<string[]> {
        const langs = await this.getActiveLanguages();
        return langs.map(l => l.code);
    },

    async getUtcOffset(code: string): Promise<number> {
        const langs = await this.getAllLanguages();
        const lang = langs.find(l => l.code === code);
        return lang ? (lang.utcOffset || 0) : 0;
    },

    async invalidateCache(): Promise<void> {
        await redisCache.del([CACHE_KEY, ALL_CACHE_KEY]);
    },
};
