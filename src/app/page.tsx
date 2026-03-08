import { prisma } from "@/lib/db";
import { PresetControls } from "@/components/layout/PresetControls";
import { Hero } from "@/components/layout/Hero";
import { SearchBar } from "@/components/features/SearchBar";
import { FeatureGrid } from "@/components/features/FeatureGrid";
import { ActionArea } from "@/components/layout/ActionArea";
import { StatsSection } from "@/components/sections/StatsSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { DnsModal } from "@/components/modals/DnsModal";
import { ScriptOverlay } from "@/components/modals/ScriptOverlay";
import { RestorePointModal } from "@/components/modals/RestorePointModal";
import { WarningModal } from "@/components/modals/WarningModal";
import { Toast } from "@/components/modals/Toast";

export default async function Home() {
    // Parallelized DB queries — all run simultaneously
    const [presetsDb, dnsProvidersDb, allFeatures] = await Promise.all([
        prisma.preset.findMany({
            where: { enabled: true },
            orderBy: { order: 'asc' },
            include: { translations: true }
        }),
        prisma.dnsProvider.findMany({
            where: { enabled: true },
            orderBy: { order: 'asc' }
        }),
        prisma.feature.findMany({
            where: { enabled: true },
            select: { slug: true }
        }),
    ]);

    // Map to a clean object for Client Component
    const presetsFormatted = presetsDb.map(p => ({
        id: p.id,
        slug: p.slug,
        featureSlugs: p.featureSlugs,
        en: p.translations.find(t => t.lang === "en")?.name || p.slug,
        tr: p.translations.find(t => t.lang === "tr")?.name || p.slug,
    }));

    const allFeatureSlugs = allFeatures.map(f => f.slug);

    return (
        <>
            <div className="flex flex-col gap-12 pt-8 animate-fade-in-up">
                <Hero />
                <section className="flex flex-col gap-6 sticky top-20 z-40 bg-[var(--bg-color)]/95 backdrop-blur-sm py-4 -mx-6 px-6 border-b border-[var(--border-color)] md:static md:bg-transparent md:border-none md:p-0 md:backdrop-blur-none animate-fade-in-up">
                    <PresetControls presets={presetsFormatted} allFeatureSlugs={allFeatureSlugs} dnsProviders={dnsProvidersDb} />
                    <SearchBar />
                </section>
                <FeatureGrid />
                <StatsSection />
                <AboutSection />
            </div>
            <ActionArea />
            {/* Modals and overlays — driven by Zustand store state */}
            <DnsModal providers={dnsProvidersDb} />
            <ScriptOverlay />
            <RestorePointModal />
            <WarningModal />
            <Toast />
        </>
    );
}

