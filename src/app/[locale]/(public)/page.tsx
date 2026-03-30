import type { Metadata } from "next";
import { cacheService } from "@/lib/cache-service";
import { Hero } from "@/components/layout/Hero";
import { FeatureGrid } from "@/components/features/FeatureGrid";
import { ActionArea } from "@/components/layout/ActionArea";
import { StatsSection } from "@/components/sections/StatsSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { DnsModal } from "@/components/modals/DnsModal";
import { HashScroller } from "@/components/shared/HashScroller";
import { StickyControlsPanel } from "@/components/layout/StickyControlsPanel";
import { getSettings } from "@/lib/settings";
import { languageService } from "@/lib/languageService";

// Task 3: Dynamic Metadata Generation Logic for Home
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const settings = await getSettings(["site_name"]);
    const siteName = settings.site_name || "OptWin";
    const languages = await languageService.getActiveLanguages();
    const currentLang = languages.find(l => l.code === locale) || languages.find(l => l.isDefault) || languages[0];
    
    // Pattern: [Sayfa Başlığı] - [Site İsmi]
    const pageTitle = currentLang?.translations?.["page.home.title"];
    const title = pageTitle ? `${pageTitle} - ${siteName}` : siteName;

    return { title };
}

interface HomeProps {
    params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomeProps) {
    const { locale } = await params;

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
            <HashScroller />
        </>
    );
}
