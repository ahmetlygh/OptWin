import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Check if the current session belongs to an admin user.
 * Returns the session if authorized, or null if not.
 */
export async function checkAdmin() {
    const session = await auth();
    if (!session?.user || !session.isAdmin) return null;
    return session;
}

/**
 * Shorthand: returns 401 JSON response for unauthorized requests.
 */
export function unauthorizedResponse() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
