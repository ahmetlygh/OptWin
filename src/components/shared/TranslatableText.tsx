"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useEffect, useState } from "react";

interface TranslatableTextProps {
    en: string;
    tr: string;
    className?: string;
    /** Pass true if you don't want a wrapper span */
    noSpan?: boolean;
}

export function TranslatableText({ en, tr, className, noSpan }: TranslatableTextProps) {
    const lang = useOptWinStore((state) => state.lang);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Avoid hydration mismatch by initially rendering nothing or English
    if (!mounted) {
        if (noSpan) return <>{en}</>;
        return <span className={className}>{en}</span>;
    }

    const text = lang === "tr" ? tr : en;

    if (noSpan) return <>{text}</>;
    return <span className={className}>{text}</span>;
}
