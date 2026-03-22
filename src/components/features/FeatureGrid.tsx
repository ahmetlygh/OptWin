import { prisma } from "@/lib/db";
import { FeatureGridClient } from "./FeatureGridClient";
import type { Category } from "@/types/feature";

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
                }
            }
        }
    });

    return <FeatureGridClient categories={categoriesDb as Category[]} />;
}
