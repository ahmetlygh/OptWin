import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const feature = await prisma.feature.findUnique({
            where: { slug: resolvedParams.id },
            include: {
                translations: true,
                commands: true,
                category: { select: { slug: true } }
            }
        });

        if (!feature) {
            const featureById = await prisma.feature.findUnique({
                where: { id: resolvedParams.id },
                include: {
                    translations: true,
                    commands: true,
                    category: { select: { slug: true } }
                }
            });
            if (!featureById) {
                return NextResponse.json({ success: false, error: "Feature not found" }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: featureById });
        }

        return NextResponse.json({ success: true, data: feature });
    } catch (error) {
        console.error("Feature API GET error:", error);
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
}
