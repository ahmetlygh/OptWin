"use client";

import { useOptWinStore } from "@/store/useOptWinStore";

interface TranslatableTextProps {
    en: string;
    tr: string;
    className?: string;
    /** Pass true if you don't want a wrapper span */
    noSpan?: boolean;
}

export function TranslatableText({ en, tr, className, noSpan }: TranslatableTextProps) {
    const lang = useOptWinStore((state) => state.lang);

    // ClientProviders already handles mounted/hydration guard
    // so we can safely read lang here without flash
    const text = lang === "tr" ? tr : en;

    if (noSpan) return <>{text}</>;
    return <span className={className}>{text}</span>;
}
