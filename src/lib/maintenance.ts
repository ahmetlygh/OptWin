import { prisma } from "@/lib/db";

let cachedValue: boolean | null = null;
let cacheTime = 0;
const CACHE_TTL = 2000; // 2 seconds

/**
 * Server-side maintenance mode check with short cache.
 * Used in server components and API routes.
 */
export async function isMaintenanceMode(): Promise<boolean> {
    const now = Date.now();
    if (cachedValue !== null && now - cacheTime < CACHE_TTL) {
        return cachedValue;
    }
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key: "maintenanceMode" },
        });
        cachedValue = setting?.value === "true";
        cacheTime = now;
        return cachedValue;
    } catch {
        return cachedValue ?? false;
    }
}

/** Invalidate the cache (call after admin toggles maintenance) */
export function invalidateMaintenanceCache() {
    cachedValue = null;
    cacheTime = 0;
}
