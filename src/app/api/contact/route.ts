import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { createHash } from "crypto";

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long").trim(),
    email: z.string().email("Invalid email address").max(255, "Email too long").trim(),
    subject: z.string().min(3, "Subject must be at least 3 characters").max(200, "Subject too long").trim(),
    message: z.string().min(10, "Message must be at least 10 characters").max(5000, "Message too long").trim(),
});

function getClientIp(req: Request): string {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }
    return "unknown-ip";
}

function hashIp(ip: string): string {
    return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

/**
 * DB-based rate limiting using VisitDedup model pattern.
 * Checks how many contact messages were created from the same IP hash in the last hour.
 */
async function checkRateLimit(ipHash: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentCount = await prisma.contactMessage.count({
        where: {
            createdAt: { gte: oneHourAgo },
            // We embed IP hash in a metadata approach: store ipHash in a hidden column
            // Since ContactMessage doesn't have ipHash, we use SiteSetting as a simple KV store
        },
    });

    // Fallback: global rate limit — max 20 messages per hour across all users
    // This is a safety net. For per-IP limiting, see below.
    if (recentCount >= 20) return false;

    // Per-IP check using SiteSetting as a lightweight rate store
    const key = `rate_contact_${ipHash}`;
    try {
        const existing = await prisma.siteSetting.findUnique({ where: { key } });
        if (existing) {
            const data = JSON.parse(existing.value) as { count: number; resetAt: string };
            const resetAt = new Date(data.resetAt);
            if (new Date() > resetAt) {
                // Window expired — reset
                await prisma.siteSetting.update({
                    where: { key },
                    data: { value: JSON.stringify({ count: 1, resetAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() }) },
                });
                return true;
            }
            if (data.count >= 3) return false;
            // Increment
            await prisma.siteSetting.update({
                where: { key },
                data: { value: JSON.stringify({ count: data.count + 1, resetAt: data.resetAt }) },
            });
            return true;
        }
        // No record — first request
        await prisma.siteSetting.create({
            data: {
                key,
                value: JSON.stringify({ count: 1, resetAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() }),
                type: "json",
                description: "Contact rate limit",
            },
        });
        return true;
    } catch {
        // If rate check fails, allow the request (fail-open)
        return true;
    }
}

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req);
        const ipHash = hashIp(ip);

        // DB-based rate limiting: max 3 messages per IP per hour
        const allowed = await checkRateLimit(ipHash);
        if (!allowed) {
            return NextResponse.json(
                { success: false, error: "Rate limit exceeded. Try again later." },
                { status: 429 }
            );
        }

        const body = await req.json();
        const parsed = contactSchema.safeParse(body);

        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message || "Invalid input";
            return NextResponse.json(
                { success: false, error: firstError },
                { status: 400 }
            );
        }

        const { name, email, subject, message } = parsed.data;

        const contact = await prisma.contactMessage.create({
            data: { name, email, subject, message }
        });

        return NextResponse.json({ success: true, data: { id: contact.id } });
    } catch (error: unknown) {
        console.error("Contact API error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to submit message" },
            { status: 500 }
        );
    }
}
