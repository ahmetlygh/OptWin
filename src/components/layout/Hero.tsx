import { prisma } from "@/lib/db";
import Image from "next/image";
import { HeroStats } from "./HeroStats";
import { HeroTitle } from "./HeroTitle";
import { HeroIllustration } from "./HeroIllustration";
import { HeroBackground } from "./HeroBackground";

export async function Hero() {
    const [stats, featuresCount] = await Promise.all([
        prisma.siteStats.findUnique({ where: { id: "main" } }),
        prisma.feature.count({ where: { enabled: true, category: { enabled: true } } })
    ]);

    const totalScripts = stats?.totalScripts || 0;
    const totalVisits = stats?.totalVisits || 0;
    const totalDownloads = (stats as Record<string, unknown>)?.totalDownloads as number || 0;

    return (
        <section className="relative w-full rounded-4xl overflow-hidden border border-(--border-color) animate-fade-in-up shadow-2xl">
            
            {/* Background Image */}
            <Image
                src="/background.webp"
                alt="OptWin Hero Background"
                fill
                priority
                unoptimized
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
            />

            {/* Overlays */}
            <div className="absolute inset-0 bg-linear-to-r from-(--bg-color)/95 via-(--bg-color)/80 to-(--bg-color)/40 z-1 pointer-events-none transition-colors duration-500"></div>
            <div className="absolute inset-0 bg-linear-to-t from-(--bg-color)/60 to-transparent z-1 pointer-events-none transition-colors duration-500"></div>
            
            {/* Ambient Background (6.1) */}
            <HeroBackground />

            {/* Content: Horizontal Layout */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 px-6 py-12 md:px-12 lg:px-16 lg:py-16">
                
                {/* Left Column: Title + Subtitle + CTA + Stats */}
                <div className="flex-1 flex flex-col w-full lg:max-w-[55%]">
                    <HeroTitle />
                    
                    {/* Stats strip */}
                    <div className="mt-8 pt-6 border-t border-(--border-color)">
                        <HeroStats
                            totalVisits={totalVisits}
                            totalScripts={totalScripts}
                            totalDownloads={totalDownloads}
                            featuresCount={featuresCount}
                        />
                    </div>
                </div>

                {/* Right Column: Terminal Illustration */}
                <div className="hidden md:flex flex-1 items-center justify-center lg:justify-end animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                    <HeroIllustration />
                </div>
            </div>
        </section>
    );
}
