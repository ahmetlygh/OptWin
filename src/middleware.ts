import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const isApiRequest = request.nextUrl.pathname.startsWith('/api');

    // Default response object
    const response = NextResponse.next();

    // Set CORS headers for API routes
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

    // Bypass maintenance check for the status endpoint itself and auth endpoints
    const bypassPaths = ['/api/system/status', '/api/auth', '/_next'];
    const shouldCheckMaintenance = !bypassPaths.some(p => request.nextUrl.pathname.startsWith(p));

    // Admin bypass via cookie
    const hasAdminBypass = request.cookies.has("admin_override");

    if (shouldCheckMaintenance && !hasAdminBypass) {
        try {
            // Note: In Next.js Edge Middleware, we can't use Prisma.
            // So we hit our own status endpoint.
            const url = new URL('/api/system/status', request.url);
            // using fetch inside middleware
            const statusReq = await fetch(url.toString(), { cache: 'no-store' });
            if (statusReq.ok) {
                const statusData = await statusReq.json();
                if (statusData.success && statusData.maintenance) {
                    return new NextResponse("Service Unavailable - Maintenance Mode", { status: 503 });
                }
            }
        } catch (error) {
            // If fetch fails, we assume we are not in maintenance mode to avoid lockouts.
            console.error("Middleware fetch error", error);
        }
    }

    return response;
}

export const config = {
    // Determine which paths the middleware should apply to
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
