"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useOptWinStore } from "@/store/useOptWinStore";

/**
 * HeroTitle renders the main hero heading with a highlighted keyword.
 * 
 * Translation keys used:
 * - hero.titleTemplate: Interpolation format (e.g. "{highlight} {prefix}")
 * - hero.titleHighlight: The word to highlight (e.g. "Optimize")
 * - hero.titlePrefix: The remaining text string
 * - hero.subtitle: Subtitle paragraph
 *
 * The component splits the title template dynamically around the markup
 * to apply gradient styling correctly regardless of language syntax order.
 */
export function HeroTitle() {
    const { t } = useTranslation();
    const { lang } = useOptWinStore();

    // Fallback to English structure if DB is wiped during dev
    const template = t["hero.titleTemplate"] || "{highlight} {prefix}";
    const highlightWord = t["hero.titleHighlight"] || "";
    const prefixWord = t["hero.titlePrefix"] || "";

    // Split template keeping delimiters
    const parts = template.split(/(\{highlight\}|\{prefix\})/g);

    return (
        <div className="min-h-[120px] sm:min-h-[160px] md:min-h-[180px] flex flex-col justify-end">
            {/* Title */}
            <h2 
                className={`text-[2rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black tracking-tight mb-3 sm:mb-4 max-w-xl lg:max-w-3xl animate-fade-in-up ${lang === 'zh' ? 'flex flex-wrap items-center gap-0' : ''}`} 
                style={{ animationDelay: "0.1s" }}
            >
                {parts.map((p, i) => {
                    const isZh = lang === 'zh';
                    
                    if (p === "{highlight}") {
                        return (
                            <span 
                                key={i} 
                                className={`text-transparent bg-clip-text bg-linear-to-r from-(--accent-color) to-purple-400 ${isZh ? 'mr-0! pr-0!' : ''}`}
                            >
                                {highlightWord}
                            </span>
                        );
                    }
                    if (p === "{prefix}") {
                        return <span key={i} className={`text-white ${isZh ? 'ml-0 pl-0' : ''}`}>{isZh ? prefixWord.replace(/\s+/g, '') : prefixWord}</span>;
                    }
                    if (p) {
                        return <span key={i} className="text-white">{isZh ? p.replace(/\s+/g, '') : p}</span>;
                    }
                    return null;
                })}
            </h2>

            {/* Subtitle */}
            <p className="text-(--text-secondary) text-[13px] sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 max-w-md lg:max-w-lg animate-fade-in-up opacity-90" style={{ animationDelay: "0.2s" }}>
                {t["hero.subtitle"]}
            </p>
        </div>
    );
}
