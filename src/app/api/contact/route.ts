import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Simple memory store for basic rate limiting on the edge
// In a serverless deployment like Vercel, this state resets frequently,
// but it's sufficient for basic protection without a Redis instance.
const ipRequestCounts = new Map<string, { count: number, resetTime: number }>();

function getClientIp(req: Request) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }
    return "unknown-ip";
}

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req);
        const now = Date.now();
        // Constraint: max 3 messages per hour
        const limitConfig = { maxRequests: 3, windowMs: 60 * 60 * 1000 };

        const record = ipRequestCounts.get(ip);
        if (record) {
            if (now > record.resetTime) {
                // Window expired, reset counter
                ipRequestCounts.set(ip, { count: 1, resetTime: now + limitConfig.windowMs });
            } else {
                if (record.count >= limitConfig.maxRequests) {
                    return NextResponse.json(
                        { success: false, error: "Rate limit exceeded. Try again later." },
                        { status: 429 }
                    );
                }
                record.count += 1;
                ipRequestCounts.set(ip, record);
            }
        } else {
            ipRequestCounts.set(ip, { count: 1, resetTime: now + limitConfig.windowMs });
        }

        const body = await req.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { success: false, error: "All fields are required" },
                { status: 400 }
            );
        }

        const contact = await prisma.contactMessage.create({
            data: { name, email, subject, message }
        });

        return NextResponse.json({ success: true, data: { id: contact.id } });
    } catch (error) {
        console.error("Contact API error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to submit message" },
            { status: 500 }
        );
    }
}
