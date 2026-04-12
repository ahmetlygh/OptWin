import { prisma } from "./db";
import { redisCache } from "./redis";
import { z } from "zod";

const LOCAL_CACHE_TTL_MS = 60 * 1000; // 1 dakika
// SWR (Bayat Veri) MANTIKLARINDAN MUAF TUTULACAK KESİN KONTROL ANAHTARLARI
const PRIORITY_KEYS = new Set(["maintenanceMode", "maintenanceReason", "maintenanceEstimatedEnd"]);

const globalForSettings = global as unknown as { settingsLocalCache: Map<string, { value: any; expiresAt: number }> };
const localCache = globalForSettings.settingsLocalCache || new Map<string, { value: any; expiresAt: number }>();
if (process.env.NODE_ENV !== "production") globalForSettings.settingsLocalCache = localCache;

// Zod Validation Schema for Runtime Safety
const SettingsValueSchema = z.any(); // Sadece parse denetimi.

// Helper for formatting keys to keep logs compact
const formatKeys = (keys: string | string[]) => {
    const arr = Array.isArray(keys) ? keys : [keys];
    if (process.env.DEBUG_SETTINGS === 'true') {
        return arr.join(', ');
    }
    if (arr.length > 3) return `${arr.length} Keys`;
    return arr.join(', ');
};

// TTY check: Sadece gerçek bir terminal bağlıysa true döner.
// Next.js dev server console.log'u yakalayıp tarayıcıya forward eder,
// bu yüzden console.log'a ASLA ANSI kodu yazmamalıyız.
// Renkli çıktı sadece process.stdout.write ile doğrudan TTY'ye yazılır.
const isTTY = typeof process !== 'undefined' && process.stdout && process.stdout.isTTY === true;

// Dinamik Milisaniye Renklendirme (sadece TTY modunda kullanılır)
const getMsColor = (ms: number) => {
    if (ms < 2) return '\x1b[32m';
    if (ms < 100) return '\x1b[33m';
    if (ms < 400) return '\x1b[38;5;208m';
    return '\x1b[31m';
};

// Compact & Smart Logging Helper
// console.log → Next.js tarafından yakalanır → tarayıcıya sızar (ANSI bozulur)
// process.stdout.write → Next.js yakalayamaz → terminalde renkli kalır
const logPerformance = (module: string, source: "Memory" | "Redis" | "DB", keys: string | string[], ms: string) => {
    const sourcePad = source.padEnd(6, ' ');
    const plainMsg = `[${module}] ${sourcePad} | ${formatKeys(keys)} - ${ms}ms`;

    if (isTTY) {
        // Gerçek terminal: doğrudan stdout'a renkli yaz, Next.js bunu yakalayamaz
        const numMs = parseFloat(ms);
        const color = getMsColor(numMs);
        process.stdout.write(`${plainMsg.replace(`${ms}ms`, `${color}${ms}ms\x1b[0m`)}\n`);
    } else {
        // Tarayıcı veya non-TTY (CI, Docker log, Next.js forwarding): saf metin
        console.log(plainMsg);
    }
};

export const settingsService = {
    /**
     * Anında temizlik: L1 Cache ve Redis içerisinden istenilen anahtarı anında siler. (Zero-Stale)
     */
    async invalidateSetting(key: string | string[]) {
        const keys = Array.isArray(key) ? key : [key];
        // 1. L1 Memory Cache Purge
        keys.forEach(k => localCache.delete(k));
        // 2. Redis Purge
        const redisKeys = keys.map(k => `optwin:setting:${k}`);
        await redisCache.del(redisKeys);
    },

    /**
     * Cache-Aside mantığı ile ayar okur. Önce Memory -> Redis -> DB.
     */
    async getSetting<T = any>(key: string, defaultValue?: T): Promise<T> {
        const start = performance.now();
        const now = Date.now();

        // 1. In-Memory Cache Kontrolü
        const cachedLocal = localCache.get(key);
        if (cachedLocal) {
            const isExpired = now > cachedLocal.expiresAt;
            const isPriority = PRIORITY_KEYS.has(key);
            
            if (!isExpired) {
                logPerformance('Settings', 'Memory', key, (performance.now() - start).toFixed(2));
                return cachedLocal.value as T;
            } else if (!isPriority) {
                settingsService._fetchAndCache([key], { [key]: defaultValue }).catch(e => console.error("SWR Error:", e));
                return cachedLocal.value as T;
            }
        }

        try {
            // 2. Önce Redis'ten dene
            const cacheKey = `optwin:setting:${key}`;
            const cachedValue = await redisCache.get(cacheKey);
            if (cachedValue !== null) {
                let parsed: any;
                try { parsed = JSON.parse(cachedValue); }
                catch { parsed = cachedValue; }
                
                localCache.set(key, { value: parsed, expiresAt: now + LOCAL_CACHE_TTL_MS });
                logPerformance('Settings', 'Redis', key, (performance.now() - start).toFixed(2));
                return parsed as T;
            }

            // 3. Redis'te yoksa DB'den al
            const record = await prisma.siteSetting.findUnique({
                where: { key }
            });

            if (record) {
                const valueToCache = record.value;
                await redisCache.set(cacheKey, valueToCache, 86400); // 24H TTL
                
                let parsed: any;
                try { parsed = JSON.parse(record.value); }
                catch { parsed = record.value; }
                
                localCache.set(key, { value: parsed, expiresAt: now + LOCAL_CACHE_TTL_MS });
                logPerformance('Settings', 'DB', key, (performance.now() - start).toFixed(2));
                return parsed as T;
            }

            // 4. DB'de de yoksa default dön
            return defaultValue as T;
        } catch (error) {
            console.error(`[SettingsService] getSetting error for key: ${key}`, error);
            // Çökmemesi için güvenli fall-back
            if (defaultValue !== undefined) {
                 return defaultValue as T;
            }
            return "" as unknown as T;
        }
    },

    /**
     * Toplu ayar çekme (Bellek + MGET ile N+1 problemini çözer).
     */
    async getSettings<T extends Record<string, any>>(keys: string[], defaultValues?: Partial<T>): Promise<T> {
        const start = performance.now();
        const now = Date.now();
        const result: Record<string, any> = {};
        
        try {
            if (!keys.length) return result as T;
            
            // 1. In-Memory Cache'ten SWR (Stale-While-Revalidate) veya Priority Kontrolü
            const missingFromMemory: string[] = [];
            const swrKeys: string[] = [];
            
            keys.forEach(key => {
                const cachedLocal = localCache.get(key);
                if (cachedLocal) {
                    const isExpired = now >= cachedLocal.expiresAt;
                    const isPriority = PRIORITY_KEYS.has(key);

                    // Eğer Priority ise ve Expired ise, bayat veriyi kesinlikle döndürme.
                    // Baştan fetch etmesi için missingFromMemory'ye yolla.
                    if (isPriority && isExpired) {
                        missingFromMemory.push(key);
                    } else {
                        result[key] = cachedLocal.value;
                        if (isExpired && !isPriority) {
                            swrKeys.push(key);
                        }
                    }
                } else {
                    missingFromMemory.push(key);
                }
            });

            // Arka planda süresi geçenleri yenile (SWR) -> Priority harici olanları
            if (swrKeys.length > 0) {
                // Background task (fire and forget)
                settingsService._fetchAndCache(swrKeys, defaultValues).catch(e => console.error("SWR Error:", e));
            }

            // Tamamı bellekte varsa direkt dön
            if (missingFromMemory.length === 0) {
                logPerformance('Settings', 'Memory', keys, (performance.now() - start).toFixed(2));
                return result as T;
            }
            
            // 2. Bellekte Olmayanlar İçin Fetch
            const fetched = await settingsService._fetchAndCache(missingFromMemory, defaultValues);
            Object.assign(result, fetched);

            return result as T;
        } catch (error) {
            console.error(`[SettingsService] getSettings error`, error);
            keys.forEach(k => { if (result[k] === undefined) result[k] = defaultValues?.[k as keyof T] ?? undefined; });
            return result as T;
        }
    },

    /**
     * Internal: Redis ve DB'den verileri çeker, Local Cache ve Redis'i besler.
     */
    async _fetchAndCache<T extends Record<string, any>>(keys: string[], defaultValues?: Partial<T>): Promise<Record<string, any>> {
        const result: Record<string, any> = {};
        if (!keys.length) return result;
        const start = performance.now();
        const now = Date.now();

        try {
            const redisKeys = keys.map(k => `optwin:setting:${k}`);
            const cachedValues = await redisCache.mget(redisKeys);
            
            const missingFromRedis: string[] = [];
            
            keys.forEach((key, index) => {
                const val = cachedValues[index];
                if (val !== null) {
                    let parsed: any;
                    try { parsed = SettingsValueSchema.parse(JSON.parse(val)); } catch { parsed = val; }
                    
                    result[key] = parsed;
                    localCache.set(key, { value: parsed, expiresAt: now + LOCAL_CACHE_TTL_MS });
                } else {
                    missingFromRedis.push(key);
                }
            });

            if (missingFromRedis.length > 0) {
                const records = await prisma.siteSetting.findMany({
                    where: { key: { in: missingFromRedis } }
                });

                const toCacheRedis: {key: string, value: string}[] = [];

                records.forEach(record => {
                    toCacheRedis.push({ key: `optwin:setting:${record.key}`, value: record.value });
                    
                    let parsed: any;
                    try { parsed = SettingsValueSchema.parse(JSON.parse(record.value)); } catch { parsed = record.value; }
                    
                    result[record.key] = parsed;
                    localCache.set(record.key, { value: parsed, expiresAt: now + LOCAL_CACHE_TTL_MS });
                });

                if (toCacheRedis.length > 0) {
                    await redisCache.mset(toCacheRedis, 86400); // 24H TTL
                }
                
                missingFromRedis.forEach(k => {
                    if (result[k] === undefined) {
                        const def = defaultValues?.[k as keyof T] ?? undefined;
                        result[k] = def;
                        if (def !== undefined) {
                            localCache.set(k, { value: def, expiresAt: now + LOCAL_CACHE_TTL_MS });
                        }
                    }
                });

                logPerformance('Settings', 'DB', keys, (performance.now() - start).toFixed(2));
            } else {
                logPerformance('Settings', 'Redis', keys, (performance.now() - start).toFixed(2));
            }
        } catch(e) {
            console.error("_fetchAndCache Error:", e);
        }
        return result;
    },

    /**
     * Hem DB'yi günceller hem de Redis + Memory cache'ini temizler.
     * Atomic Update: Önce DB yazılır, ardindan anlık Invalidation tetiklenir.
     */
    async updateSetting(key: string, value: any, type: string = "string", description?: string): Promise<boolean> {
        try {
            const stringValue = typeof value === "string" ? value : JSON.stringify(value);

            await prisma.siteSetting.upsert({
                where: { key },
                update: {
                    value: stringValue,
                    type,
                    ...(description && { description })
                },
                create: {
                    key,
                    value: stringValue,
                    type,
                    description
                }
            });

            // Cache Invalidation
            await this.invalidateSetting(key);
            
            return true;
        } catch (error) {
            console.error(`[SettingsService] updateSetting error for key: ${key}`, error);
            return false;
        }
    },

    /**
     * Çoklu ayarlar için hem DB'yi günceller hem de Redis + Memory cache'ini uçurur.
     */
    async updateSettings(settings: { key: string; value: any; type?: string; description?: string }[]): Promise<boolean> {
        if (!settings.length) return true;
        try {
            await prisma.$transaction(
                settings.map((s) => {
                    const stringValue = typeof s.value === "string" ? s.value : JSON.stringify(s.value);
                    return prisma.siteSetting.upsert({
                        where: { key: s.key },
                        update: {
                            value: stringValue,
                            ...(s.type && { type: s.type }),
                            ...(s.description && { description: s.description }),
                        },
                        create: {
                            key: s.key,
                            value: stringValue,
                            type: s.type || "string",
                            description: s.description || "",
                        },
                    });
                })
            );

            // Cache Invalidation
            await this.invalidateSetting(settings.map(s => s.key));

            return true;
        } catch (error) {
            console.error(`[SettingsService] updateSettings bulk error:`, error);
            return false;
        }
    }
};
