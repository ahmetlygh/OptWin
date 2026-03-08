"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { getTranslation, type TranslationKeys } from "@/i18n";

/**
 * React hook for translations.
 * Returns `t` object with all translation keys, and `lang` for the current language.
 *
 * Usage:
 *   const { t, lang } = useTranslation();
 *   <span>{t["hero.titlePrefix"]}</span>
 */
export function useTranslation() {
    const lang = useOptWinStore((state) => state.lang);
    const t = getTranslation(lang);
    return { t, lang };
}

export type { TranslationKeys };
