import { cacheService } from "@/lib/cache-service";
import { Hero } from "@/components/layout/Hero";
import { FeatureGrid } from "@/components/features/FeatureGrid";
import { ActionArea } from "@/components/layout/ActionArea";
import { StatsSection } from "@/components/sections/StatsSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { DnsModal } from "@/components/modals/DnsModal";
import { HashScroller } from "@/components/shared/HashScroller";
import { StickyControlsPanel } from "@/components/layout/StickyControlsPanel";

interface HomeProps {
    params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomeProps) {
    const { locale } = await params;

    // HIGH-PERFORMANCE REDIS FETCH
    const [presets, dnsProviders, allFeatureSlugs] = await Promise.all([
        cacheService.getPresets(locale),
        cacheService.getDnsProviders(),
        cacheService.getFeatureSlugs(),
    ]);

    return (
        <>
            <div className="flex flex-col gap-12 pt-8 animate-fade-in-up">
                <Hero />
                <StickyControlsPanel
                    presets={presets}
                    allFeatureSlugs={allFeatureSlugs}
                    dnsProviders={dnsProviders}
                />
                <div style={{ overflowAnchor: "none" }}>
                    <FeatureGrid params={Promise.resolve({ locale })} />
                </div>
                <StatsSection />
                <AboutSection />
            </div>
            <ActionArea />
            <DnsModal providers={dnsProviders} />
            <HashScroller />
        </>
    );
}
