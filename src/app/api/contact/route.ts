import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { createHash, createHmac } from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET || "default_captcha_secret_optwin";

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long").trim(),
    email: z.string().email("Invalid email address").max(255, "Email too long").trim(),
    subject: z.string().min(3, "Subject must be at least 3 characters").max(200, "Subject too long").trim(),
    message: z.string().min(20, "Message must be at least 20 characters").max(1000, "Message too long").trim(),
    captchaToken: z.string().min(1, "Token empty"),
    captchaAnswer: z.number(),
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

function verifyCaptcha(token: string, userAnswer: number): boolean {
    try {
        const decoded = Buffer.from(token, "base64").toString("utf8");
        const [data, hash] = decoded.split("|");
        const [answerStr, timestampStr] = data.split(":");
        
        // 15-minute expiration
        if (Date.now() - parseInt(timestampStr) > 15 * 60 * 1000) return false;
        
        const expectedHash = createHmac("sha256", SECRET).update(data).digest("hex");
        if (expectedHash !== hash) return false;

        return parseInt(answerStr) === userAnswer;
    } catch {
        return false;
    }
}

/**
 * DB-based rate limiting using SiteSetting
 */
async function checkRateLimit(ipHash: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentCount = await prisma.contactMessage.count({
        where: {
            createdAt: { gte: oneHourAgo },
        },
    });

    if (recentCount >= 20) return false; // Global hourly limit

    const key = `rate_contact_${ipHash}`;
    try {
        const existing = await prisma.siteSetting.findUnique({ where: { key } });
        if (existing) {
            const data = JSON.parse(existing.value) as { count: number; resetAt: string };
            const resetAt = new Date(data.resetAt);
            if (new Date() > resetAt) {
                await prisma.siteSetting.update({
                    where: { key },
                    data: { value: JSON.stringify({ count: 1, resetAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() }) },
                });
                return true;
            }
            if (data.count >= 3) return false; // Per IP Limit
            await prisma.siteSetting.update({
                where: { key },
                data: { value: JSON.stringify({ count: data.count + 1, resetAt: data.resetAt }) },
            });
            return true;
        }
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
        return true; // Fail-open
    }
}

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req);
        const ipHash = hashIp(ip);
        
        // Metadata Capture
        const userAgent = req.headers.get("user-agent") || "unknown";
        const referrer = req.headers.get("referer") || "unknown";
        const locale = req.headers.get("accept-language")?.split(',')[0] || "unknown";

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

        const { name, email, subject, message, captchaToken, captchaAnswer } = parsed.data;

        // Verify Anti-Spam Captcha
        const isBot = !verifyCaptcha(captchaToken, captchaAnswer);
        const spamScore = isBot ? 0 : 100;

        if (isBot) {
            return NextResponse.json(
                { success: false, error: "Anti-spam verification failed. Please check your math." },
                { status: 403 }
            );
        }

        // @ts-ignore - Prisma schema is updated but typings need dev server restart
        const contact = await prisma.contactMessage.create({
            data: { 
                name, 
                email, 
                subject, 
                message,
                // Captured Metadata
                ipHash,
                userAgent: userAgent.substring(0, 200), // Trim if too long
                locale,
                referrer: referrer.substring(0, 200),
                spamScore,
            }
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

