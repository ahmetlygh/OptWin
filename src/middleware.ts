import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/* ── In-memory maintenance cache for middleware ──────────────── */
let maintenanceCache: { value: boolean; time: number } | null = null;
const CACHE_TTL = 3000; // 3 seconds

async function checkMaintenance(origin: string): Promise<boolean> {
    const now = Date.now();
    if (maintenanceCache && now - maintenanceCache.time < CACHE_TTL) {
        return maintenanceCache.value;
    }
    try {
        const res = await fetch(`${origin}/api/maintenance`, {
            cache: 'no-store',
            headers: { 'x-middleware-internal': '1' },
        });
        const data = await res.json();
        const val = data.maintenance === true;
        maintenanceCache = { value: val, time: now };
        return val;
    } catch {
        return maintenanceCache?.value ?? false;
    }
}

/* ── Paths that are ALWAYS allowed (even during maintenance) ── */
const ALWAYS_ALLOWED = [
    '/admin',           // All admin routes
    '/api/admin',       // All admin API routes
    '/api/auth',        // NextAuth
    '/api/maintenance', // Maintenance status check (used by this middleware)
    '/api/system',      // System status
    '/_next',           // Next.js internals
    '/favicon.ico',
    '/optwin.png',
    '/assets',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Pass pathname to server components via header
    const response = NextResponse.next();
    response.headers.set('x-next-pathname', pathname);

    // CORS for API routes
    const isApiRequest = pathname.startsWith('/api');
    if (isApiRequest) {
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (request.method === 'OPTIONS') {
            const optionsResponse = new NextResponse(null, { status: 200 });
            optionsResponse.headers.set('Access-Control-Allow-Origin', '*');
            optionsResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            optionsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            return optionsResponse;
        }
    }

    // Check if path is always allowed
    const isAllowed = ALWAYS_ALLOWED.some(p => pathname.startsWith(p));
    if (isAllowed) return response;

    // ── Maintenance mode: block ALL public routes ──
    const isMaintenance = await checkMaintenance(request.nextUrl.origin);

    if (isMaintenance) {
        // For page requests, return maintenance HTML directly (no site JS bundles)
        if (!isApiRequest) {
            return new NextResponse(MAINTENANCE_HTML, {
                status: 503,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Retry-After': '300',
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'X-Robots-Tag': 'noindex',
                },
            });
        }

        // For API requests, return 503 JSON
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
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};

/* ── Self-contained maintenance HTML (no external dependencies) ── */
const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/>
<title>OptWin — Maintenance</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#08080d;color:#fff;font-family:system-ui,-apple-system,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden}
.bg{position:fixed;inset:0;z-index:0}
.bg .g1{position:absolute;top:-20%;left:50%;transform:translateX(-50%);width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(107,91,230,.1) 0%,transparent 70%)}
.bg .g2{position:absolute;bottom:-15%;left:25%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(147,51,234,.07) 0%,transparent 70%)}
.c{position:relative;z-index:1;text-align:center;padding:2rem;max-width:420px}
.logo{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:2rem}
.logo img{width:48px;height:48px;filter:drop-shadow(0 0 16px rgba(107,91,230,.5))}
.logo h1{font-size:1.8rem;font-weight:900;background:linear-gradient(to right,#fff,#6b5be6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
@keyframes spin{to{transform:rotate(360deg)}}
.gear{width:56px;height:56px;margin:0 auto 2rem;animation:spin 4s linear infinite;color:rgba(107,91,230,.4)}
h2{font-size:1.5rem;font-weight:700;margin-bottom:1.2rem}
.desc{color:rgba(255,255,255,.35);font-size:.82rem;line-height:1.7;margin-bottom:2rem}
.bar{width:280px;height:2px;background:rgba(255,255,255,.06);border-radius:999px;overflow:hidden;margin:0 auto 8px;position:relative}
@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}
.bar span{position:absolute;top:0;left:0;height:100%;width:33%;background:linear-gradient(to right,transparent,rgba(107,91,230,.6),transparent);border-radius:999px;animation:slide 2s ease-in-out infinite}
.status{font-size:.68rem;color:rgba(255,255,255,.2);font-weight:500;margin-bottom:2rem}
.copy{position:fixed;bottom:2rem;left:0;right:0;text-align:center;font-size:.7rem;color:rgba(255,255,255,.15)}
</style>
</head>
<body>
<div class="bg"><div class="g1"></div><div class="g2"></div></div>
<div class="c">
<div class="logo"><img src="/optwin.png" alt="OptWin"/><h1>OptWin</h1></div>
<svg class="gear" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
<h2>Under Maintenance</h2>
<p class="desc">Our website is temporarily unavailable due to scheduled maintenance. We'll be back online shortly.</p>
<div class="bar"><span></span></div>
<p class="status">Work in progress</p>
</div>
<div class="copy">&copy; 2025 OptWin. All rights reserved.</div>
<script>
// Auto-reload every 15 seconds to check if maintenance is over
setInterval(function(){
  fetch('/api/maintenance').then(function(r){return r.json()}).then(function(d){
    if(!d.maintenance) window.location.reload();
  }).catch(function(){});
},15000);
</script>
</body>
</html>`;
