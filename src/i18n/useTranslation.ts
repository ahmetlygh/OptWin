"use client";

import { useMemo } from "react";
import { useOptWinStore } from "@/store/useOptWinStore";
import { getTranslation, type TranslationKeys } from "@/i18n";

/**
 * React hook for translations.
 * Priority: DB translations (UiTranslation table) → Static locale file → key itself
 *
 * Usage:
 *   const { t, lang } = useTranslation();
 *   <span>{t["hero.titlePrefix"]}</span>
 */
export function useTranslation() {
    const lang = useOptWinStore((state) => state.lang);
    const dbTranslations = useOptWinStore((state) => state.dbTranslations);

    const t = useMemo(() => {
        const staticTranslations = getTranslation(lang);
        // Merge: DB translations override static ones
        // Use a Proxy to provide dynamic key access with fallback chain
        return new Proxy({} as Record<TranslationKeys, string>, {
            get(_target, prop: string) {
                // 1. DB translation (highest priority — admin editable)
                if (dbTranslations[prop]) return dbTranslations[prop];
                // 2. Static locale file (bundled fallback)
                if ((staticTranslations as Record<string, string>)[prop]) {
                    return (staticTranslations as Record<string, string>)[prop];
                }
                // 3. Key itself (development fallback)
                return prop;
            },
        });
    }, [lang, dbTranslations]);

    return { t, lang };
}

export type { TranslationKeys };
