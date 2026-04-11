"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useOptWinStore } from "@/store/useOptWinStore";
import { ArrowRight } from "lucide-react";

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
        <div className="flex flex-col w-full">
            {/* Title */}
            <h1 
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white tracking-tight leading-[1.1] mb-4 max-w-2xl animate-fade-in-up ${lang === 'zh' ? 'flex flex-wrap items-center gap-0' : ''}`} 
                style={{ animationDelay: "0.1s" }}
            >
                {parts.map((p, i) => {
                    const isZh = lang === 'zh';
                    
                    if (p === "{highlight}") {
                        return (
                            <span 
                                key={i} 
                                className={`text-transparent bg-clip-text bg-linear-to-r from-(--accent-color) via-purple-400 to-(--accent-color) hover-bg-flow transition-all cursor-default ${isZh ? 'mr-0! pr-0!' : ''}`}
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
            </h1>

            {/* Subtitle */}
            <p className="text-(--text-secondary) text-[14px] sm:text-base md:text-lg leading-relaxed mb-8 max-w-lg animate-fade-in-up opacity-90" style={{ animationDelay: "0.2s" }}>
                {t["hero.subtitle"]}
            </p>

            {/* CTA Button */}
            <div className="flex animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <a 
                    href="#features" 
                    onClick={(e) => { 
                        e.preventDefault(); 
                        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); 
                    }} 
                    className="group cursor-pointer inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-linear-to-r from-(--accent-color) via-purple-500 to-(--accent-color) hover-bg-flow text-white font-bold hover:shadow-lg hover:shadow-(--accent-color)/30 active:scale-[0.97] transition-all duration-200"
                >
                    {t["hero.cta"] || "Explore Optimizations"}
                    <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                </a>
            </div>
        </div>
    );
}
