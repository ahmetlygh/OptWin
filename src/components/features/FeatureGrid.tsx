import { prisma } from "@/lib/db";
import { FeatureGridClient } from "./FeatureGridClient";

export async function FeatureGrid() {
    // Fetch active categories and features
    const categoriesDb = await prisma.category.findMany({
        where: { enabled: true },
        orderBy: { order: 'asc' },
        include: {
            translations: true,
            features: {
                where: { enabled: true },
                orderBy: { order: 'asc' },
                include: {
                    translations: true,
                    commands: true
                }
            }
        }
    });

    const dnsProvidersDb = await prisma.dnsProvider.findMany({
        where: { enabled: true },
        orderBy: { order: 'asc' }
    });

    // Pass data to Client component for live search filtering
    return <FeatureGridClient categories={categoriesDb as any} dnsProviders={dnsProvidersDb} />;
}
