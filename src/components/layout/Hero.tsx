import { getSettings } from "@/lib/settings";
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

    const titleEn = getTranslation("hero.title", "en", "Unleash Your PC's True Potential");
    const titleTr = getTranslation("hero.title", "tr", "Bilgisayarınızın Gerçek Potansiyelini Ortaya Çıkarın");

    const subtitleEn = getTranslation("hero.subtitle", "en", "OptWin is an advanced open-source utility designed to optimize your operating system for maximum performance, lower latency, and enhanced privacy.");
    const subtitleTr = getTranslation("hero.subtitle", "tr", "OptWin, maksimum performans, düşük gecikme ve gelişmiş gizlilik için işletim sisteminizi optimize etmek üzere tasarlanmış gelişmiş bir açık kaynaklı yardımcı programdır.");

    return (
        <section className="text-center mb-10 animate-fade-in-up mt-6">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-color)] via-[var(--accent-color)] to-[var(--primary-color)] px-4 pb-1">
                <TranslatableText en={titleEn} tr={titleTr} />
            </h1>
            <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed px-4">
                <TranslatableText en={subtitleEn} tr={subtitleTr} />
            </p>
        </section>
    );
}
