import { cacheService } from "@/lib/cache-service";
import { DnsProvider } from "@/types/feature";
import { FeatureGridClient } from "./FeatureGridClient";
import type { Category } from "@/types/feature";

interface FeatureGridProps {
    params: Promise<{ locale: string }>;
}

export async function FeatureGrid({ params }: FeatureGridProps) {
    const { locale } = await params;
    
    // REDIS JSON FETCH (Sub-millisecond)
    const categories = await cacheService.getCategories(locale);
    const presets = await cacheService.getPresets(locale);
    const allFeatureSlugs = await cacheService.getFeatureSlugs();
    const dnsProviders = await cacheService.getDnsProviders();

    return <FeatureGridClient categories={categories as Category[]} presets={presets} allFeatureSlugs={allFeatureSlugs} dnsProviders={dnsProviders as DnsProvider[]} />;
}
