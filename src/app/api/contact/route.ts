import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long").trim(),
    email: z.string().email("Invalid email address").max(255, "Email too long").trim(),
    subject: z.string().min(3, "Subject must be at least 3 characters").max(200, "Subject too long").trim(),
    message: z.string().min(10, "Message must be at least 10 characters").max(5000, "Message too long").trim(),
});

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
    } catch (error) {
        console.error("Contact API error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to submit message" },
            { status: 500 }
        );
    }
}
