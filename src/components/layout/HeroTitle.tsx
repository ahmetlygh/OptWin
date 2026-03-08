"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useOptWinStore } from "@/store/useOptWinStore";

// Each language defines: parts array where each part is { text, highlight: boolean }
// This lets the highlighted word appear naturally in any position per language
const titleParts: Record<string, { text: string; highlight: boolean }[]> = {
    en: [
        { text: "Optimize ", highlight: true },
        { text: "your Windows Experience", highlight: false },
    ],
    tr: [
        { text: "Windows Deneyiminizi ", highlight: false },
        { text: "Hızlandırın", highlight: true },
    ],
    zh: [
        { text: "优化 ", highlight: true },
        { text: "你的 Windows 体验", highlight: false },
    ],
    es: [
        { text: "Optimiza ", highlight: true },
        { text: "tu Experiencia Windows", highlight: false },
    ],
    hi: [
        { text: "अपने Windows अनुभव को ", highlight: false },
        { text: "बेहतर बनाएं", highlight: true },
    ],
    de: [
        { text: "Optimieren ", highlight: true },
        { text: "Sie Ihr Windows-Erlebnis", highlight: false },
    ],
    fr: [
        { text: "Optimisez ", highlight: true },
        { text: "votre Expérience Windows", highlight: false },
    ],
};

export function HeroTitle() {
    const { t } = useTranslation();
    const lang = useOptWinStore((s) => s.lang);
    const parts = titleParts[lang] || titleParts.en;

    return (
        <div className="min-h-[140px] sm:min-h-[160px] md:min-h-[180px] flex flex-col justify-end">
            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black leading-[1.1] tracking-tight mb-4 max-w-xl lg:max-w-3xl animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                {parts.map((part, i) => (
                    <span
                        key={i}
                        className={part.highlight
                            ? "text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-purple-400"
                            : "text-white"
                        }
                    >
                        {part.text}
                    </span>
                ))}
            </h2>

            {/* Subtitle */}
            <p className="text-[var(--text-secondary)] text-sm sm:text-base md:text-lg leading-relaxed mb-8 max-w-md lg:max-w-lg animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                {t["hero.subtitle"]}
            </p>
        </div>
    );
}
