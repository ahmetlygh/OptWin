import { prisma } from "./db";
import { redisCache } from "./redis";

// Key Prefixes for Redis JSON entities
const KEY_FEATURE = "optwin:entity:feature:";
const KEY_CATEGORY = "optwin:entity:category:";
const KEY_DNS = "optwin:entity:dns:";
const KEY_PRESET = "optwin:entity:preset:";
const KEY_FEATURE_SLUGS = "optwin:entity:feature_slugs";

export const cacheService = {
  /**
   * Fetches all active feature slugs
   */
  async getFeatureSlugs() {
    const cached = await redisCache.get(KEY_FEATURE_SLUGS);
    if (cached) return JSON.parse(cached);

    const features = await prisma.feature.findMany({
      where: { enabled: true, category: { enabled: true } },
      select: { slug: true },
    });
    const slugs = features.map((f) => f.slug);
    await redisCache.set(KEY_FEATURE_SLUGS, JSON.stringify(slugs), 86400);
    return slugs;
  },
  /**
   * Fetches localized Categories from Cache or DB
   */
  /**
   * Helper to get all active locales for invalidation
   */
  async _getAllLocales() {
    try {
      const langs = await prisma.language.findMany({ where: { isActive: true }, select: { code: true } });
      return langs.map(l => l.code);
    } catch {
      return ["en", "tr", "de", "fr", "es", "zh", "hi"];
    }
  },

  /**
   * Fetches localized Categories from Cache or DB
   */
  async getCategories(lang: string) {
    const cacheKey = `${KEY_CATEGORY}${lang}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const categories = await prisma.category.findMany({
      where: { enabled: true },
      orderBy: { order: "asc" },
      include: {
        translations: { where: { OR: [{ lang }, { lang: "en" }] } },
        features: {
          where: { enabled: true },
          orderBy: { order: "asc" },
          include: { 
            translations: { where: { OR: [{ lang }, { lang: "en" }] } }
          },
        },
      },
    });

    // Format for easier frontend ingestion
    const formatted = categories.map((cat) => {
      // Find target or fallback (en)
      const catTrans = cat.translations.find(t => t.lang === lang) || cat.translations.find(t => t.lang === "en");
      
      return {
        ...cat,
        name: catTrans?.name || cat.slug,
        features: cat.features.map((f) => {
          const fTrans = f.translations.find(t => t.lang === lang) || f.translations.find(t => t.lang === "en");
          return {
            ...f,
            title: fTrans?.title || f.slug,
            desc: fTrans?.desc || "",
          };
        }),
      };
    });

    await redisCache.set(cacheKey, JSON.stringify(formatted), 86400); // 24H TTL
    return formatted;
  },

  /**
   * Fetches full Features with Commands for Script Generator
   */
  async getFeaturesWithCommands(lang: string) {
    const cacheKey = `optwin:cache:features_all:${lang}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const features = await prisma.feature.findMany({
      where: { enabled: true, category: { enabled: true } },
      include: { commands: { where: { lang } } },
      orderBy: { order: "asc" },
    });

    await redisCache.set(cacheKey, JSON.stringify(features), 604800); // 7D TTL
    return features;
  },

  /**
   * Fetches DNS Providers from Cache or DB
   */
  async getDnsProviders() {
    const cacheKey = KEY_DNS;
    const cached = await redisCache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const providers = await prisma.dnsProvider.findMany({
      where: { enabled: true },
      orderBy: { order: "asc" },
    });

    await redisCache.set(cacheKey, JSON.stringify(providers), 86400);
    return providers;
  },

  /**
   * Fetches DNS Provider by SLUG (Performance Critical for Script Generator)
   */
  async getDnsProvider(slug: string) {
    const providers = await this.getDnsProviders();
    return providers.find((p: any) => p.slug === slug) || null;
  },

  /**
   * Fetches Presets from Cache or DB
   */
  async getPresets(lang: string) {
    const cacheKey = `${KEY_PRESET}${lang}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const presets = await prisma.preset.findMany({
      where: { enabled: true },
      orderBy: { order: "asc" },
      include: {
        translations: { where: { OR: [{ lang }, { lang: "en" }] } },
      },
    });

    const formatted = presets.map((p) => {
      const pTrans = p.translations.find(t => t.lang === lang) || p.translations.find(t => t.lang === "en");
      return {
        ...p,
        name: pTrans?.name || p.slug,
      };
    });

    await redisCache.set(cacheKey, JSON.stringify(formatted), 86400);
    return formatted;
  },

  /**
   * Fetches PageContent sections from Cache or DB
   */
  async getPageContent(pageSlug: string, lang: string) {
    const cacheKey = `optwin:entity:pagecontent:${pageSlug}:${lang}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    let content = await prisma.pageContent.findMany({
      where: { pageSlug, lang },
      orderBy: { sectionOrder: "asc" },
    });

    if (content.length === 0 && lang !== "en") {
        content = await prisma.pageContent.findMany({
            where: { pageSlug, lang: "en" },
            orderBy: { sectionOrder: "asc" },
        });
    }

    const formatted = content.map((c) => ({
        title: c.title,
        content: JSON.parse(c.content) as string[]
    }));

    await redisCache.set(cacheKey, JSON.stringify(formatted), 86400);
    return formatted;
  },

  /**
   * Invalidate specific or ALL entity caches
   */
  async invalidate(type: "feature" | "category" | "dns" | "preset") {
    const locales = await this._getAllLocales();
    const keys: string[] = [];

    if (type === "dns") {
      keys.push(KEY_DNS);
    } else if (type === "feature" || type === "category") {
      keys.push(KEY_FEATURE_SLUGS);
      locales.forEach((l) => {
        keys.push(`${KEY_FEATURE}${l}`);
        keys.push(`${KEY_CATEGORY}${l}`);
        keys.push(`optwin:cache:features_all:${l}`);
        keys.push(`optwin:cache:labels:${l}`);
      });
    } else {
      locales.forEach((l) => keys.push(`${KEY_PRESET}${l}`));
    }

    if (keys.length > 0) {
      await redisCache.del(keys);
    }
    // Her ihtimale karşı PageContent pattern invalidate eklenebilir veya ayrı tutulur.
  },
};
