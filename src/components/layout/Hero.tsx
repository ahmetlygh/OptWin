import { prisma } from "@/lib/db";
import Image from "next/image";
import { HeroStats } from "./HeroStats";
import { HeroTitle } from "./HeroTitle";

export async function Hero() {
    const [stats, featuresCount] = await Promise.all([
        prisma.siteStats.findUnique({ where: { id: "main" } }),
        prisma.feature.count({ where: { enabled: true } })
    ]);

    const totalScripts = stats?.totalScripts || 0;
    const totalVisits = stats?.totalVisits || 0;
    const totalDownloads = (stats as Record<string, unknown>)?.totalDownloads as number || 0;

    return (
        <section className="relative flex flex-col w-full rounded-[1.5rem] overflow-hidden border border-[var(--border-color)] animate-fade-in-up sm:min-h-[380px] md:min-h-[420px] lg:min-h-[440px]">

            {/* Background Image */}
            <Image
                src="/background.png"
                alt="OptWin Hero Background"
                fill
                priority
                quality={85}
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
            />

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d12]/95 via-[#0d0d12]/85 to-[#0d0d12]/40 z-[1]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12]/80 via-[#0d0d12]/20 to-transparent z-[1]"></div>

            {/* Content */}
            <div className="relative flex-1 z-10 px-5 py-8 sm:p-8 md:p-12 lg:p-16 flex flex-col w-full transform transition-all duration-1000 animate-fade-in-up">

                {/* Title — rendered client-side for per-language highlighting */}
                <HeroTitle />

                {/* Hero Stats (Client Component) */}
                <HeroStats
                    totalVisits={totalVisits}
                    totalScripts={totalScripts}
                    totalDownloads={totalDownloads}
                    featuresCount={featuresCount}
                />
            </div>
        </section>
    );
}
