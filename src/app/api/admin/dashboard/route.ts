import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin, unauthorizedResponse } from "@/lib/admin-guard";
import { settingsService } from "@/lib/settingsService";

export async function GET() {
    if (!(await checkAdmin())) return unauthorizedResponse();

    const limitSetting = await settingsService.getSetting("admin_dashboard_limit", "5");
    const limit = parseInt(limitSetting, 10) || 5;

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
        prisma.feature.count({ where: { enabled: true, category: { enabled: true } } }),
        prisma.category.count(),
        prisma.contactMessage.count({ where: { deleted: false } }),
        prisma.contactMessage.count({ where: { read: false, deleted: false } }),
        prisma.contactMessage.findMany({
            where: { deleted: false },
            orderBy: { createdAt: "desc" },
            take: limit,
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
