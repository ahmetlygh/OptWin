import type { Metadata } from "next";
import { cacheService } from "@/lib/cache-service";
import { Hero } from "@/components/layout/Hero";
import { FeatureGrid } from "@/components/features/FeatureGrid";
import { ActionArea } from "@/components/layout/ActionArea";
import { AboutSection } from "@/components/sections/AboutSection";
import { ValuePropositionSection } from "@/components/sections/ValuePropositionSection";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { DnsModal } from "@/components/modals/DnsModal";
import { HashScroller } from "@/components/shared/HashScroller";
import { StickyControlsPanel } from "@/components/layout/StickyControlsPanel";
import { getSettings } from "@/lib/settings";
import { languageService } from "@/lib/languageService";
import { getTranslationsFromDb } from "@/lib/translations";

export const dynamic = "force-dynamic";

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


    const [presets, dnsProviders, allFeatureSlugs, translations, categories] = await Promise.all([
        cacheService.getPresets(locale),
        cacheService.getDnsProviders(),
        cacheService.getFeatureSlugs(),
        getTranslationsFromDb(locale),
        cacheService.getCategories(locale),
    ]);
    const allCategorySlugs = categories.map((c: any) => c.slug);

    return (
        <>
            <div className="flex flex-col gap-12 pt-8 animate-fade-in-up">
                <Hero />
                
                {/* Marketing Funnel */}
                <ValuePropositionSection locale={locale} />
                <BeforeAfterSection locale={locale} translations={translations} />
                <HowItWorksSection locale={locale} translations={translations} />

                {/* Application Section */}
                <div id="features" className="scroll-mt-32">
                    <StickyControlsPanel
                        presets={presets}
                        allFeatureSlugs={allFeatureSlugs}
                        allCategorySlugs={allCategorySlugs}
                        dnsProviders={dnsProviders}
                    />
                </div>
                <div style={{ overflowAnchor: "none" }}>
                    <FeatureGrid params={Promise.resolve({ locale })} />
                </div>
                
                <AboutSection />
            </div>
            <ActionArea />
            <HashScroller />
        </>
    );
}
