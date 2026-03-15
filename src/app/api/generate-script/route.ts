import { NextResponse } from "next/server";
import { generateScript } from "@/lib/script-generator";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { features, dnsProvider, lang, createRestorePoint } = body;

        if (!features || !Array.isArray(features)) {
            return NextResponse.json({ error: "Missing or invalid features array" }, { status: 400 });
        }

        const scriptString = await generateScript({
            features,
            dnsProvider,
            lang: lang || "en",
            createRestorePoint: !!createRestorePoint
        });

        // Increment selectCount for each selected feature (fire and forget)
        if (features.length > 0) {
            prisma.feature.updateMany({
                where: { slug: { in: features } },
                data: { selectCount: { increment: 1 } },
            }).catch(() => {});
        }

        return NextResponse.json({ script: scriptString });
    } catch (error: any) {
        console.error("Script generation error:", error);
        return NextResponse.json({ error: "Failed to generate script" }, { status: 500 });
    }
}
