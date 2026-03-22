import { NextResponse } from "next/server";
import { generateScript } from "@/lib/script-generator";
import { prisma } from "@/lib/db";
import { z } from "zod";

const SUPPORTED_LANGS = ["en", "tr", "de", "fr", "es", "zh", "hi"] as const;

const scriptRequestSchema = z.object({
    features: z.array(z.string().max(100)).min(1).max(200),
    dnsProvider: z.string().max(50).nullable().optional(),
    lang: z.enum(SUPPORTED_LANGS).default("en"),
    createRestorePoint: z.boolean().default(false),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = scriptRequestSchema.safeParse(body);

        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message || "Invalid input";
            return NextResponse.json({ error: firstError }, { status: 400 });
        }

        const { features, dnsProvider, lang, createRestorePoint } = parsed.data;

        const scriptString = await generateScript({
            features,
            dnsProvider: dnsProvider ?? null,
            lang,
            createRestorePoint,
        });

        // Increment selectCount for each selected feature (fire and forget)
        if (features.length > 0) {
            prisma.feature.updateMany({
                where: { slug: { in: features } },
                data: { selectCount: { increment: 1 } },
            }).catch(() => {});
        }

        return NextResponse.json({ script: scriptString });
    } catch (error: unknown) {
        console.error("Script generation error:", error);
        return NextResponse.json({ error: "Failed to generate script" }, { status: 500 });
    }
}
