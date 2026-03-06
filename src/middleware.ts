import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const isApiRequest = request.nextUrl.pathname.startsWith('/api');

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

    // Maintenance mode via env variable (no self-fetch needed)
    const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

    if (isMaintenanceMode) {
        const bypassPaths = ['/api/system/status', '/api/auth', '/_next'];
        const shouldBlock = !bypassPaths.some(p => request.nextUrl.pathname.startsWith(p));
        const hasAdminBypass = request.cookies.has("admin_override");

        if (shouldBlock && !hasAdminBypass) {
            return new NextResponse("Service Unavailable - Maintenance Mode", { status: 503 });
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
