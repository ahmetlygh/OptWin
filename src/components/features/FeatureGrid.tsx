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

    // Pass data to Client component for live search filtering
    return <FeatureGridClient categories={categoriesDb as any} />;
}
