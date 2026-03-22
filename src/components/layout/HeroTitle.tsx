"use client";

import { useTranslation } from "@/i18n/useTranslation";

/**
 * HeroTitle renders the main hero heading with a highlighted keyword.
 * 
 * Translation keys used:
 * - hero.title.text: Full title text (e.g. "Optimize your Windows Experience")
 * - hero.title.highlight: The word to highlight (e.g. "Optimize")
 * - hero.subtitle: Subtitle paragraph
 * 
 * The component splits the title text around the highlight word
 * to apply gradient styling to the highlighted portion.
 */
export function HeroTitle() {
    const { t } = useTranslation();

    const fullTitle = t["hero.title.text"];
    const highlightWord = t["hero.title.highlight"];

    // Split the title around the highlight word to render it with gradient
    const highlightIndex = fullTitle.indexOf(highlightWord);
    const before = highlightIndex > 0 ? fullTitle.slice(0, highlightIndex) : "";
    const after = highlightIndex >= 0 ? fullTitle.slice(highlightIndex + highlightWord.length) : "";
    const hasHighlight = highlightIndex >= 0;

    return (
        <div className="min-h-[120px] sm:min-h-[160px] md:min-h-[180px] flex flex-col justify-end">
            {/* Title */}
            <h2 className="text-[2rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black tracking-tight mb-3 sm:mb-4 max-w-xl lg:max-w-3xl animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                {hasHighlight ? (
                    <>
                        {before && <span className="text-white">{before}</span>}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-purple-400">
                            {highlightWord}
                        </span>
                        {after && <span className="text-white">{after}</span>}
                    </>
                ) : (
                    <span className="text-white">{fullTitle}</span>
                )}
            </h2>

            {/* Subtitle */}
            <p className="text-[var(--text-secondary)] text-[13px] sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 max-w-md lg:max-w-lg animate-fade-in-up opacity-90" style={{ animationDelay: "0.2s" }}>
                {t["hero.subtitle"]}
            </p>
        </div>
    );
}
