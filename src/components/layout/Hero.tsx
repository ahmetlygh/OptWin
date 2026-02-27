import { prisma } from "@/lib/db";
import { TranslatableText } from "../shared/TranslatableText";

export async function Hero() {
    // Fetch hero DB contents 
    const uiTranslations = await prisma.uiTranslation.findMany({
        where: {
            key: {
                in: ["hero.title", "hero.subtitle"]
            }
        }
    });

    const getTranslation = (key: string, lang: string, fallback: string) => {
        return uiTranslations.find(t => t.key === key && t.lang === lang)?.value || fallback;
    };

    const titleEn = getTranslation("hero.title", "en", "Windows experience");
    const titleTr = getTranslation("hero.title", "tr", "Windows deneyiminizi");

    const subtitleEn = getTranslation("hero.subtitle", "en", "The premium optimization tool for power users and gamers. Debloat, tweak, and accelerate your system with a single script.");
    const subtitleTr = getTranslation("hero.subtitle", "tr", "Gelişmiş kullanıcılar ve oyuncular için premium optimizasyon aracı. Tek bir komut dosyası ile sisteminizi temizleyin, ince ayar yapın ve hızlandırın.");

    return (
        <section className="relative rounded-2xl overflow-hidden bg-[var(--card-bg)] border border-[var(--border-color)] animate-fade-in-up">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-color)] via-[var(--bg-color)]/90 to-transparent"></div>

            <div className="relative z-10 p-8 md:p-12 flex flex-col items-start max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/30 text-[var(--accent-color)] text-xs font-bold uppercase tracking-wider mb-4">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse"></span> v2.4 Released
                </div>

                <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4 text-white">
                    <TranslatableText en="Optimize your " tr="Optimize edin " />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-purple-400">
                        <TranslatableText en={titleEn} tr={titleTr} noSpan />
                    </span>
                </h2>

                <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-lg">
                    <TranslatableText en={subtitleEn} tr={subtitleTr} />
                </p>

                <div className="flex flex-wrap gap-6 items-center">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-white">2.4M+</span>
                        <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">
                            <TranslatableText en="Downloads" tr="İndirme" noSpan />
                        </span>
                    </div>
                    <div className="w-px h-10 bg-[var(--border-color)]"></div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-white">150+</span>
                        <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">
                            <TranslatableText en="Optimizations" tr="Optimizasyon" noSpan />
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
