import { prisma } from "@/lib/db";
import { TranslatableText } from "../shared/TranslatableText";
import Image from "next/image";
import { HeroStats } from "./HeroStats";

export async function Hero() {
    // Parallel fetch for all data
    const [uiTranslations, stats, featuresCount] = await Promise.all([
        prisma.uiTranslation.findMany({
            where: {
                key: {
                    in: ["hero.title", "hero.subtitle"]
                }
            }
        }),
        prisma.siteStats.findUnique({ where: { id: "main" } }),
        prisma.feature.count({ where: { enabled: true } })
    ]);

    const getTranslation = (key: string, lang: string, fallback: string) => {
        return uiTranslations.find(t => t.key === key && t.lang === lang)?.value || fallback;
    };

    const titleEn = getTranslation("hero.title", "en", "Windows Experience");
    const titleTr = getTranslation("hero.title", "tr", "Windows Deneyiminizi Hızlandırın");

    const subtitleEn = getTranslation("hero.subtitle", "en", "The premium optimization tool for power users and gamers. Debloat, tweak, and accelerate your system with a single script.");
    const subtitleTr = getTranslation("hero.subtitle", "tr", "Gelişmiş kullanıcılar ve oyuncular için premium optimizasyon aracı. Tek bir komut dosyası ile sisteminizi temizleyin, ince ayar yapın ve hızlandırın.");

    const totalScripts = stats?.totalScripts || 0;
    const totalVisits = stats?.totalVisits || 0;



    return (
        <section className="relative rounded-[1.5rem] overflow-hidden border border-[var(--border-color)] animate-fade-in-up min-h-[340px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[440px]">

            {/* Background Image with next/image for optimization */}
            <Image
                src="/background.png"
                alt="OptWin Hero Background"
                fill
                priority
                quality={85}
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
            />

            {/* Dark overlay gradient — left-to-right for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d12]/95 via-[#0d0d12]/80 to-[#0d0d12]/30 z-[1]"></div>

            {/* Bottom fade for smooth blend with page */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12]/70 via-transparent to-transparent z-[1]"></div>

            {/* Content */}
            <div className="relative z-10 p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col items-start justify-center h-full transform transition-all duration-1000 animate-fade-in-up">

                {/* Title */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black leading-[1.1] tracking-tight mb-6 max-w-xl lg:max-w-3xl animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    <span className="text-white">
                        <TranslatableText en="Optimize your " tr="Windows Deneyiminizi " />
                    </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-purple-400">
                        <TranslatableText en="Windows Experience" tr="Hızlandırın" noSpan />
                    </span>
                </h2>

                {/* Subtitle */}
                <p className="text-[var(--text-secondary)] text-sm sm:text-base md:text-lg leading-relaxed mb-8 max-w-md lg:max-w-lg animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                    <TranslatableText en={subtitleEn} tr={subtitleTr} />
                </p>

                {/* Hero Stats (Client Component) */}
                <HeroStats
                    totalVisits={totalVisits}
                    totalScripts={totalScripts}
                    featuresCount={featuresCount}
                />
            </div>
        </section>
    );
}
