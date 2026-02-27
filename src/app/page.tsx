import { prisma } from "@/lib/db";
import { PresetControls } from "@/components/layout/PresetControls";
import { Hero } from "@/components/layout/Hero";
import { SearchBar } from "@/components/features/SearchBar";
import { FeatureGrid } from "@/components/features/FeatureGrid";
import { DnsPanel } from "@/components/features/DnsPanel";
import { ActionArea } from "@/components/layout/ActionArea";
import { StatsSection } from "@/components/sections/StatsSection";
import { AboutSection } from "@/components/sections/AboutSection";

export default async function Home() {
  // Fetch Presets and DNS providers Server Side strictly to pass down
  const presetsDb = await prisma.preset.findMany({
    where: { enabled: true },
    orderBy: { order: 'asc' },
    include: { translations: true }
  });

  const dnsProvidersDb = await prisma.dnsProvider.findMany({
    where: { enabled: true },
    orderBy: { order: 'asc' }
  });

  // Map to a clean object for Client Component
  const presetsFormatted = presetsDb.map(p => ({
    id: p.id,
    slug: p.slug,
    featureSlugs: p.featureSlugs,
    en: p.translations.find(t => t.lang === "en")?.name || p.slug,
    tr: p.translations.find(t => t.lang === "tr")?.name || p.slug,
  }));

  const allFeatures = await prisma.feature.findMany({
    where: { enabled: true },
    select: { slug: true }
  });
  const allFeatureSlugs = allFeatures.map(f => f.slug);

  return (
    <div className="flex flex-col gap-12 pt-8 animate-fade-in-up">
      <Hero />
      <PresetControls presets={presetsFormatted} allFeatureSlugs={allFeatureSlugs} />
      <SearchBar />
      <FeatureGrid />
      <DnsPanel providers={dnsProvidersDb} />
      <ActionArea />
      <StatsSection />
      <AboutSection />
    </div>
  );
}
