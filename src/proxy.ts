import { NextRequest, NextResponse } from 'next/server';

/* ═══════════════════════════════════════════════════════════════
   Rate Limiting — In-memory sliding window
   Limits: /api/generate-script (10/min), /api/stats (30/min),
           /api/features (60/min), /api/contact (5/min)
   Note: Per-instance. For multi-instance, replace with Redis.
   ═══════════════════════════════════════════════════════════════ */

type RateLimitEntry = { count: number; resetAt: number };
const rateLimitMap = new Map<string, RateLimitEntry>();
const RL_CLEANUP_INTERVAL = 5 * 60 * 1000;

function cleanupRateLimit() {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetAt) rateLimitMap.delete(key);
    }
}

// Background cleanup independent of user requests 
if (typeof setInterval !== "undefined") {
    const timer = setInterval(cleanupRateLimit, RL_CLEANUP_INTERVAL);
    if (timer.unref) timer.unref(); // Prevent blocking process exit
}

type RateLimitConfig = { maxRequests: number; windowMs: number };

const RATE_LIMITS: Record<string, RateLimitConfig> = {
    '/api/generate-script': { maxRequests: 10, windowMs: 60_000 },
    '/api/stats': { maxRequests: 30, windowMs: 60_000 },
    '/api/features': { maxRequests: 60, windowMs: 60_000 },
    '/api/contact': { maxRequests: 5, windowMs: 60_000 },
};

function getClientIp(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    return req.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs });
        return { allowed: true, remaining: config.maxRequests - 1 };
    }

    if (entry.count >= config.maxRequests) {
        return { allowed: false, remaining: 0 };
    }

    entry.count++;
    return { allowed: true, remaining: config.maxRequests - entry.count };
}

import { redisCache } from "@/lib/redis";

/* ═══════════════════════════════════════════════════════════════
   Maintenance Mode — Redis Direct Fetch
   ═══════════════════════════════════════════════════════════════ */

interface MaintenanceInfo { active: boolean; reason: string; estimatedEnd: string }

async function checkMaintenance(origin: string): Promise<MaintenanceInfo> {
    try {
        // middleware standalone environment without strict Edge limitations allows native net streams locally/docker
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

/* ── Locales ── */
async function getLanguageSets() {
    try {
        const activeRaw = await redisCache.get("optwin:languages:active");
        const allRaw = await redisCache.get("optwin:languages:all");
        
        const active = activeRaw ? JSON.parse(activeRaw).map((l: any) => l.code) : ['en', 'tr'];
        const all = allRaw ? JSON.parse(allRaw).map((l: any) => l.code) : active;
        
        return { active, all };
    } catch {
        return { active: ['en', 'tr'], all: ['en', 'tr'] };
    }
}

async function getPreferredLocale(request: NextRequest, activeLocales: string[]): Promise<string> {
    const defaultLocale = (await redisCache.get("optwin:setting:default_lang")) || 'en';
    
    // 1. Explicit user choice via strictly synced Cookie
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
    if (cookieLocale && activeLocales.includes(cookieLocale)) return cookieLocale;
    
    // 2. Browser default
    const acceptLang = request.headers.get('accept-language');
    if (acceptLang) {
        const browserMatch = acceptLang.split(',').map(l => l.trim().split(';')[0].slice(0, 2)).find(code => activeLocales.includes(code));
        if (browserMatch) return browserMatch;
    }
    
    // 3. Fallback
    return activeLocales.includes(defaultLocale) ? defaultLocale : (activeLocales[0] || 'en');
}

/* ── Paths that are ALWAYS allowed (even during maintenance) ── */
const ALWAYS_ALLOWED = [
    '/admin',
    '/api/admin',
    '/api/auth',
    '/api/maintenance',
    '/api/system',
    '/_next',
    '/favicon.ico',
    '/optwin.png',
    '/assets',
];

const LOCALE_BYPASS = [
    '/admin',
    '/api',
    '/_next',
    '/favicon.ico',
    '/optwin.png',
    '/assets',
];

export default async function proxy(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl;
        const { active: ACTIVE_LOCALES, all: ALL_LOCALES } = await getLanguageSets();

        // Pass pathname to server components via header safely
        const response = NextResponse.next();
        response.headers.set('x-next-pathname', pathname || '/');

        const isApiRequest = pathname.startsWith('/api');
        
        // ── Segment-based Locale Redirection ──
        const isBypassed = LOCALE_BYPASS.some(p => pathname.startsWith(p) || pathname === p);
        
        // Check if the current path starts with ANY known language code
        const segment = pathname.split('/')[1];
        const hasAnyLocaleSegment = ALL_LOCALES.includes(segment);
        const hasActiveLocaleSegment = ACTIVE_LOCALES.includes(segment);
        
        // 1. If it's an INACTIVE locale segment, redirect to home with preferred locale
        if (hasAnyLocaleSegment && !hasActiveLocaleSegment && !isBypassed) {
            const locale = await getPreferredLocale(request, ACTIVE_LOCALES);
            return NextResponse.redirect(new URL(`/${locale}`, request.url));
        }

        // 2. If it has NO locale segment at all, redirect to preferred locale
        if (!isBypassed && !hasActiveLocaleSegment) {
            const locale = await getPreferredLocale(request, ACTIVE_LOCALES);
            // Construct strictly matched segment paths: / -> /en, /privacy -> /en/privacy
            const newSegments = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
            const redirectUrl = new URL(newSegments, request.url);
            request.nextUrl.searchParams.forEach((val, key) => redirectUrl.searchParams.append(key, val));
            return NextResponse.redirect(redirectUrl);
        }

        // Safe retrieval of site URL through Redis fallback
        let siteUrl = "";
        try {
            const cachedUrl = await redisCache.get("optwin:setting:site_url");
            siteUrl = cachedUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://optwin.tech';
        } catch {
            siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://optwin.tech';
        }
        const targetUrl = siteUrl || 'https://optwin.tech'; // graceful fallback to prevent charCodeAt parsing error

        // ── CORS for API routes ──
        if (isApiRequest) {
            const origin = request.headers.get('origin') || '';
            const allowedOrigins = [
                targetUrl,
                targetUrl.replace('https://', 'https://www.'),
                'http://localhost:3000',
            ];

            // Safe startsWith checks
            const corsOrigin = allowedOrigins.some(o => o && origin.startsWith(o)) ? origin : '';

            if (corsOrigin) {
                response.headers.set('Access-Control-Allow-Origin', corsOrigin);
                response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }

            if (request.method === 'OPTIONS') {
                const optionsResponse = new NextResponse(null, { status: 200 });
                if (corsOrigin) {
                    optionsResponse.headers.set('Access-Control-Allow-Origin', corsOrigin);
                    optionsResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                    optionsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                }
                return optionsResponse;
            }

            // ── Rate Limiting (public API only, skip admin & auth) ──
            if (!pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/auth/')) {
                const matchedPath = Object.keys(RATE_LIMITS).find(p => p && pathname.startsWith(p));
                if (matchedPath) {
                    const rlConfig = RATE_LIMITS[matchedPath];
                    const ip = getClientIp(request);
                    const key = `${matchedPath}:${ip}`;
                    const { allowed, remaining } = checkRateLimit(key, rlConfig);

                    if (!allowed) {
                        return NextResponse.json(
                            { error: 'Too many requests. Please try again later.' },
                            {
                                status: 429,
                                headers: {
                                    'Retry-After': '60',
                                    'X-RateLimit-Limit': rlConfig.maxRequests.toString(),
                                    'X-RateLimit-Remaining': '0',
                                },
                            }
                        );
                    }

                    response.headers.set('X-RateLimit-Limit', rlConfig.maxRequests.toString());
                    response.headers.set('X-RateLimit-Remaining', remaining.toString());
                }
            }
        }

        // Check if path is always allowed (skip maintenance check)
        const isAllowed = ALWAYS_ALLOWED.some(p => p && pathname.startsWith(p));
        if (isAllowed) return response;

        // ── Maintenance mode: block ALL public routes ──
        const mInfo = await checkMaintenance(request.nextUrl.origin || '/');
        
        // Normalized path check: is any segment literally "maintenance"?
        const isAtMaintenance = pathname.split('/').some(s => s === 'maintenance');

        if (mInfo.active) {
            if (!isApiRequest) {
                // Storm-Killer: If already on maintenance page, do not redirect
                if (isAtMaintenance) {
                    const rewriteRes = NextResponse.next();
                    rewriteRes.headers.set('x-next-pathname', pathname);
                    return rewriteRes;
                }

                // Redirect to the localized strictly SSR maintenance page
                const locale = await getPreferredLocale(request, ACTIVE_LOCALES);
                const redirectUrl = new URL(`/${locale}/maintenance`, request.url);
                const rd = NextResponse.redirect(redirectUrl);
                rd.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
                rd.headers.set('x-next-pathname', pathname);
                return rd;
            }

            return NextResponse.json(
                { error: 'Service Unavailable', maintenance: true },
                {
                    status: 503,
                    headers: {
                        'Retry-After': '300',
                        'Cache-Control': 'no-store',
                    },
                }
            );
        } else {
            // If maintenance is OFF, block users from visiting the maintenance page manually
            if (!isApiRequest && isAtMaintenance) {
                const locale = await getPreferredLocale(request, ACTIVE_LOCALES);
                return NextResponse.redirect(new URL(`/${locale}`, request.url));
            }
        }

        return response;
    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],};
