"use client";

import { useOptWinStore } from "@/store/useOptWinStore";

interface TranslatableTextProps {
    en: string;
    tr: string;
    zh?: string;
    es?: string;
    hi?: string;
    de?: string;
    fr?: string;
    className?: string;
    /** Pass true if you don't want a wrapper span */
    noSpan?: boolean;
}

export function TranslatableText({ en, tr, zh, es, hi, de, fr, className, noSpan }: TranslatableTextProps) {
    const lang = useOptWinStore((state) => state.lang);

    const translations: Record<string, string | undefined> = {
        en,
        tr,
        zh,
        es,
        hi,
        de,
        fr,
    };

    // Use the selected language's text, fallback to English if not available
    const text = translations[lang] || en;

    if (noSpan) return <>{text}</>;
    return <span className={className}>{text}</span>;
}
