import { cacheService } from "@/lib/cache-service";
import { FeatureGridClient } from "./FeatureGridClient";
import type { Category } from "@/types/feature";

interface FeatureGridProps {
    params: Promise<{ locale: string }>;
}

export async function FeatureGrid({ params }: FeatureGridProps) {
    const { locale } = await params;
    
    // REDIS JSON FETCH (Sub-millisecond)
    const categories = await cacheService.getCategories(locale);

    return <FeatureGridClient categories={categories as Category[]} />;
}
