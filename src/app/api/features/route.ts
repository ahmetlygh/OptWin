import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const features = await prisma.feature.findMany({
            where: { enabled: true, category: { enabled: true } },
            include: {
                translations: true,
                category: {
                    select: { slug: true }
                }
            },
            orderBy: { order: 'asc' }
        });

        const formatted = features.map(f => ({
            id: f.slug,
            categoryId: f.category.slug,
            icon: f.icon,
            iconType: f.iconType,
            risk: f.risk,
            noRisk: f.noRisk,
            newBadge: f.newBadge,
            newBadgeExpiry: f.newBadgeExpiry?.toISOString() || null,
            translations: f.translations.reduce((acc, current) => ({
                ...acc,
                [current.lang]: {
                    title: current.title,
                    desc: current.desc
                }
            }), {})
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error("Features API GET error:", error);
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
}
