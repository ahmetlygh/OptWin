import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

async function checkAdmin() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || !(session as any).isAdmin) return false;
    return true;
}

export async function GET() {
    if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [
        stats,
        featuresCount,
        enabledFeaturesCount,
        categoriesCount,
        totalMessages,
        unreadMessages,
        recentMessages,
        dnsCount,
    ] = await Promise.all([
        prisma.siteStats.findUnique({ where: { id: "main" } }),
        prisma.feature.count(),
        prisma.feature.count({ where: { enabled: true } }),
        prisma.category.count(),
        prisma.contactMessage.count({ where: { deleted: false } }),
        prisma.contactMessage.count({ where: { read: false, deleted: false } }),
        prisma.contactMessage.findMany({
            where: { deleted: false },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: { id: true, name: true, subject: true, read: true, createdAt: true },
        }),
        prisma.dnsProvider.count({ where: { enabled: true } }),
    ]);

    return NextResponse.json({
        success: true,
        data: {
            totalVisits: stats?.totalVisits || 0,
            totalScripts: stats?.totalScripts || 0,
            totalDownloads: stats?.totalDownloads || 0,
            featuresCount,
            enabledFeaturesCount,
            categoriesCount,
            totalMessages,
            unreadMessages,
            recentMessages,
            dnsCount,
        },
    });
}
