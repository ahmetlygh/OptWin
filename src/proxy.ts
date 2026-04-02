import { NextRequest, NextResponse } from 'next/server';
import { redisCache } from "@/lib/redis";

/* ═══════════════════════════════════════════════════════════════
   Task 1: Anti-Crash Fail-safe (In-Memory Shadow Cache)
   ═══════════════════════════════════════════════════════════════ */
let LATEST_ACTIVE_LOCALES = ['tr', 'en'];
let LATEST_ALL_LOCALES = ['tr', 'en'];
let LATEST_DEFAULT_LANG = 'tr';

interface MaintenanceInfo { active: boolean; reason: string; estimatedEnd: string }

async function checkMaintenance(origin: string): Promise<MaintenanceInfo> {
    try {
        const active = await redisCache.get("optwin:setting:maintenanceMode");
        const reason = await redisCache.get("optwin:setting:maintenanceReason");
        const time = await redisCache.get("optwin:setting:maintenanceEstimatedEnd");

        return {
            active: active === "true",
            reason: reason || "",
            estimatedEnd: time || "",
        };
    } catch {
        return { active: false, reason: '', estimatedEnd: '' };
    }
}

/* ── Locales Logic with Memory Fail-Safe ── */
async function getLanguageSets(request: NextRequest) {
    try {
        const activeRaw = await redisCache.get("optwin:languages:active");
        const allRaw = await redisCache.get("optwin:languages:all");

        if (!activeRaw || !allRaw) {
            try {
                const res = await fetch(`${request.nextUrl.origin}/api/admin/languages`, { 
                    cache: 'no-store',
                    headers: { 'x-internal-fetch': 'true' }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        const active = data.filter((l: any) => l.isActive).map((l: any) => l.code);
                        const all = data.map((l: any) => l.code);
                        
                        LATEST_ACTIVE_LOCALES = active;
                        LATEST_ALL_LOCALES = all;
                        
                        // Fire and forget updating Redis to prevent 404s until the cache is formally rebuilt
                        redisCache.set("optwin:languages:active", JSON.stringify(data.filter((l: any) => l.isActive)), 86400).catch(()=>{});
                        redisCache.set("optwin:languages:all", JSON.stringify(data), 86400).catch(()=>{});
    
                        return { active, all };
                    }
                }
            } catch (fetchErr) {
                console.error("[Middleware] Fallback API Language Fetch Failed.", fetchErr);
            }
        }
        
        const active = activeRaw ? JSON.parse(activeRaw).map((l: any) => l.code) : LATEST_ACTIVE_LOCALES;
        const all = allRaw ? JSON.parse(allRaw).map((l: any) => l.code) : LATEST_ALL_LOCALES;
        
        // Update shadow cache on successful fetch
        if (activeRaw) LATEST_ACTIVE_LOCALES = active;
        if (allRaw) LATEST_ALL_LOCALES = all;

        return { active, all };
    } catch (error) {
        console.error("[Middleware] Redis Language Fetch Failed. Using shadow cache fallback.");
        return { active: LATEST_ACTIVE_LOCALES, all: LATEST_ALL_LOCALES };
    }
}

async function getPreferredLocale(request: NextRequest, activeLocales: string[]): Promise<string> {
    let defaultLocale = LATEST_DEFAULT_LANG;
    try {
        const cached = await redisCache.get("optwin:setting:default_lang");
        if (cached) {
            defaultLocale = cached;
            LATEST_DEFAULT_LANG = cached;
        }
    } catch { /* Fallback to LATEST_DEFAULT_LANG from shadow cache */ }
    
    // 1. Cookie
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
    if (cookieLocale && activeLocales.includes(cookieLocale)) return cookieLocale;
    
    // 2. Browser
    const acceptLang = request.headers.get('accept-language');
    if (acceptLang) {
        const browserMatch = acceptLang.split(',').map(l => l.trim().split(';')[0].slice(0, 2)).find(code => activeLocales.includes(code));
        if (browserMatch) return browserMatch;
    }
    
    // 3. Choice
    return activeLocales.includes(defaultLocale) ? defaultLocale : (activeLocales[0] || 'tr');
}

const ALWAYS_ALLOWED = [
    '/admin', '/api/admin', '/api/auth', '/api/maintenance', '/api/system', '/_next', '/favicon.ico', '/optwin.png', '/background.png', '/assets',
];

const LOCALE_BYPASS = [
    '/admin', '/api', '/_next', '/favicon.ico', '/optwin.png', '/background.png', '/assets',
];

export default async function proxy(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl;
        
        // 0. EXTREMELY IMPORTANT: Prevent infinite loop for internal fallback fetches
        if (request.headers.get('x-internal-fetch') === 'true') {
            return NextResponse.next();
        }

        const { active: ACTIVE_LOCALES, all: ALL_LOCALES } = await getLanguageSets(request);

        const response = NextResponse.next();
        response.headers.set('x-next-pathname', pathname || '/');

        const isApiRequest = pathname.startsWith('/api');
        const isBypassed = LOCALE_BYPASS.some(p => pathname.startsWith(p) || pathname === p);
        
        const segment = pathname.split('/')[1];
        const hasAnyLocaleSegment = ALL_LOCALES.includes(segment);
        const hasActiveLocaleSegment = ACTIVE_LOCALES.includes(segment);
        
        // 1. Inactive segment check
        if (hasAnyLocaleSegment && !hasActiveLocaleSegment && !isBypassed) {
            const locale = await getPreferredLocale(request, ACTIVE_LOCALES);
            return NextResponse.redirect(new URL(`/${locale}`, request.url));
        }

        // 2. Missing locale segment check
        if (!isBypassed && !hasActiveLocaleSegment) {
            const locale = await getPreferredLocale(request, ACTIVE_LOCALES);
            const newSegments = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
            const redirectUrl = new URL(newSegments, request.url);
            request.nextUrl.searchParams.forEach((val, key) => redirectUrl.searchParams.append(key, val));
            return NextResponse.redirect(redirectUrl);
        }

        // --- Maintenance Mode Check ---
        const isAllowed = ALWAYS_ALLOWED.some(p => p && pathname.startsWith(p));
        if (isAllowed) return response;

        const mInfo = await checkMaintenance(request.nextUrl.origin || '/');
        const isAtMaintenance = pathname.split('/').some(s => s === 'maintenance');

        if (mInfo.active) {
            if (!isApiRequest) {
                if (isAtMaintenance) return response;
                const locale = await getPreferredLocale(request, ACTIVE_LOCALES);
                return NextResponse.redirect(new URL(`/${locale}/maintenance`, request.url));
            }
            return NextResponse.json({ error: 'Service Unavailable', maintenance: true }, { status: 503 });
        } else {
            if (!isApiRequest && isAtMaintenance) {
                const locale = await getPreferredLocale(request, ACTIVE_LOCALES);
                return NextResponse.redirect(new URL(`/${locale}`, request.url));
            }
        }

        return response;
    } catch (error) {
        console.error("Proxy Critical Error:", error);
        return NextResponse.next();
    }
}

export const config = {
    matcher: ['/admin/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
