import { prisma } from "@/lib/db";
import { Hero } from "@/components/layout/Hero";
import { FeatureGrid } from "@/components/features/FeatureGrid";
import { ActionArea } from "@/components/layout/ActionArea";
import { StatsSection } from "@/components/sections/StatsSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { DnsModal } from "@/components/modals/DnsModal";
import { ScriptOverlay } from "@/components/modals/ScriptOverlay";
import { RestorePointModal } from "@/components/modals/RestorePointModal";
import { WarningModal } from "@/components/modals/WarningModal";
import { Toast } from "@/components/modals/Toast";
import { HashScroller } from "@/components/shared/HashScroller";
import { StickyControlsPanel } from "@/components/layout/StickyControlsPanel";

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
            where: { enabled: true, category: { enabled: true } },
            select: { slug: true }
        }),
    ]);

    // Map to a clean object for Client Component
    const presetsFormatted = presetsDb.map(p => ({
        id: p.id,
        slug: p.slug,
        featureSlugs: p.featureSlugs,
        translations: p.translations.map(t => ({ lang: t.lang, name: t.name })),
    }));

    const allFeatureSlugs = allFeatures.map(f => f.slug);

    return (
        <>
            <div className="flex flex-col gap-12 pt-8 animate-fade-in-up">
                <Hero />
                <StickyControlsPanel
                    presets={presetsFormatted}
                    allFeatureSlugs={allFeatureSlugs}
                    dnsProviders={dnsProvidersDb}
                />
                <div style={{ overflowAnchor: "none" }}>
                    <FeatureGrid />
                </div>
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
            <HashScroller />
        </>
    );
}

