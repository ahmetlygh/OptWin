import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

/**
 * Server-side maintenance mode check with Next.js built-in cache.
 * Revalidates every 2 seconds — works correctly across instances.
 */
export const isMaintenanceMode = unstable_cache(
    async (): Promise<boolean> => {
        try {
            const setting = await prisma.siteSetting.findUnique({
                where: { key: "maintenanceMode" },
            });
            return setting?.value === "true";
        } catch {
            return false;
        }
    },
    ["maintenance-mode"],
    { revalidate: 2 }
);

/**
 * Reusable utility to check maintenance status directly inside API routes.
 * Bypasses unstable_cache to read the latest DB state, providing a strict 503 guard.
 */
export async function checkMaintenanceStatus() {
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key: "maintenanceMode" },
        });
        const active = setting?.value === "true";
        if (active) {
            return new Response(
                JSON.stringify({ error: "Service Unavailable", maintenance: true }),
                {
                    status: 503,
                    headers: {
                        "Content-Type": "application/json",
                        "Retry-After": "300",
                        "Cache-Control": "no-store",
                    },
                }
            );
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Invalidate the maintenance cache.
 * After Next.js 16 stabilizes revalidateTag, switch to that.
 * For now, the 2-second TTL ensures fast staleness expiry.
 */
export function invalidateMaintenanceCache() {
    // With unstable_cache + revalidate:2, cache auto-expires.
    // This function exists for API compatibility — no manual invalidation needed.
}
