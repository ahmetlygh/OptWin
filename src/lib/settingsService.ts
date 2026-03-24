import { prisma } from "./db";
import { redisCache } from "./redis";

export const settingsService = {
    /**
     * Cache-Aside mantığı ile ayar okur. Önce Redis'e bakar, yoksa DB'den alır ve Redis'e 24 saatliğine yazar.
     * JSON olarak dönüştürülebilen değerler objeye çevrilir, değilse string olarak döner.
     */
    async getSetting<T = any>(key: string, defaultValue?: T): Promise<T> {
        const start = performance.now();
        try {
            // 1. Önce Redis'ten dene
            const cacheKey = `optwin:setting:${key}`;
            const cachedValue = await redisCache.get(cacheKey);
            if (cachedValue !== null) {
                const time = (performance.now() - start).toFixed(2);
                console.log(`[Settings] Fetching '${key}' from Redis - Time: ${time}ms`);
                try {
                    return JSON.parse(cachedValue) as T;
                } catch {
                    return cachedValue as unknown as T;
                }
            }

            // 2. Redis'te yoksa DB'den al
            const record = await prisma.siteSetting.findUnique({
                where: { key }
            });

            if (record) {
                const valueToCache = record.value;
                await redisCache.set(cacheKey, valueToCache, 86400); // 24H TTL
                const time = (performance.now() - start).toFixed(2);
                console.log(`[Settings] Fetching '${key}' from DB - Time: ${time}ms`);
                try {
                    return JSON.parse(record.value) as T;
                } catch {
                    return record.value as unknown as T;
                }
            }

            // 3. DB'de de yoksa default dön
            const time = (performance.now() - start).toFixed(2);
            console.log(`[Settings] Fetching '${key}' from Default - Time: ${time}ms`);
            return defaultValue as T;
        } catch (error) {
            console.error(`[SettingsService] getSetting error for key: ${key}`, error);
            return defaultValue as T;
        }
    },

    /**
     * Toplu ayar çekme (MGET ile N+1 problemini çözer).
     */
    async getSettings<T extends Record<string, any>>(keys: string[], defaultValues?: Partial<T>): Promise<T> {
        const start = performance.now();
        const result: Record<string, any> = {};
        
        try {
            if (!keys.length) return result as T;
            
            const redisKeys = keys.map(k => `optwin:setting:${k}`);
            const cachedValues = await redisCache.mget(redisKeys);
            
            const missingKeys: string[] = [];
            
            keys.forEach((key, index) => {
                const val = cachedValues[index];
                if (val !== null) {
                    try {
                        result[key] = JSON.parse(val);
                    } catch {
                        result[key] = val;
                    }
                } else {
                    missingKeys.push(key);
                }
            });

            if (missingKeys.length > 0) {
                const records = await prisma.siteSetting.findMany({
                    where: { key: { in: missingKeys } }
                });

                const toCache: {key: string, value: string}[] = [];

                records.forEach(record => {
                    toCache.push({ key: `optwin:setting:${record.key}`, value: record.value });
                    try {
                        result[record.key] = JSON.parse(record.value);
                    } catch {
                        result[record.key] = record.value;
                    }
                });

                if (toCache.length > 0) {
                    await redisCache.mset(toCache, 86400);
                }
                
                // missingKeys içinde olup DB'de de olmayanları defaultValue ile doldur
                missingKeys.forEach(k => {
                    if (result[k] === undefined) {
                        result[k] = defaultValues?.[k as keyof T] ?? undefined;
                    }
                });

                const time = (performance.now() - start).toFixed(2);
                console.log(`[Settings] Fetching [${keys.join(', ')}] from Redis+DB - Time: ${time}ms`);
            } else {
                const time = (performance.now() - start).toFixed(2);
                console.log(`[Settings] Fetching [${keys.join(', ')}] from Redis - Time: ${time}ms`);
            }

            return result as T;
        } catch (error) {
            console.error(`[SettingsService] getSettings error`, error);
            keys.forEach(k => { result[k] = defaultValues?.[k as keyof T] ?? undefined; });
            return result as T;
        }
    },

    /**
     * Hem DB'yi günceller hem de Redis cache'ini temizler.
     * Opsiyonel olarak güncellenen data döner.
     */
    async updateSetting(key: string, value: any, type: string = "string", description?: string): Promise<boolean> {
        try {
            // Primitive değerler stringleşmezse sıkıntı yaratabilir
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

            // Redis'ten cash'i uçur.
            await redisCache.del(`optwin:setting:${key}`);
            
            return true;
        } catch (error) {
            console.error(`[SettingsService] updateSetting error for key: ${key}`, error);
            return false;
        }
    },

    /**
     * Çoklu ayarlar için hem DB'yi günceller hem de Redis cache keylerini array olarak siler.
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

            const redisKeys = settings.map((s) => `optwin:setting:${s.key}`);
            await redisCache.del(redisKeys);

            return true;
        } catch (error) {
            console.error(`[SettingsService] updateSettings bulk error:`, error);
            return false;
        }
    }
};
