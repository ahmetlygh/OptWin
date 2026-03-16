import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export default async function AdminDashboard() {
    const session = await auth();
    const [
        stats,
        featuresCount,
        enabledFeaturesCount,
        categoriesCount,
        totalMessages,
        unreadMessages,
        recentMessages,
        dnsCount,
        topFeatures,
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
            take: 5,
            select: { id: true, name: true, subject: true, read: true, createdAt: true },
        }),
        prisma.dnsProvider.count({ where: { enabled: true } }),
        prisma.feature.findMany({
            where: { enabled: true },
            orderBy: { selectCount: "desc" },
            take: 8,
            select: {
                id: true,
                slug: true,
                selectCount: true,
                translations: { where: { lang: "en" }, select: { title: true } },
                category: { select: { translations: { where: { lang: "en" }, select: { name: true } } } },
            },
        }),
    ]);

    const userName = session?.user?.name || "Admin";

    return (
        <AdminDashboardClient
            userName={userName}
            data={{
                totalVisits: stats?.totalVisits || 0,
                totalScripts: stats?.totalScripts || 0,
                totalDownloads: stats?.totalDownloads || 0,
                featuresCount,
                enabledFeaturesCount,
                categoriesCount,
                totalMessages,
                unreadMessages,
                recentMessages: recentMessages.map(m => ({
                    ...m,
                    createdAt: m.createdAt.toISOString(),
                })),
                dnsCount,
                topFeatures: topFeatures.map(f => ({
                    id: f.id,
                    slug: f.slug,
                    title: f.translations[0]?.title || f.slug,
                    category: f.category?.translations[0]?.name || "—",
                    selectCount: f.selectCount,
                })),
            }}
        />
    );
}
