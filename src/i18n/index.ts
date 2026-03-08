import en, { type TranslationKeys } from "./locales/en";
import tr from "./locales/tr";
import zh from "./locales/zh";
import es from "./locales/es";
import hi from "./locales/hi";
import de from "./locales/de";
import fr from "./locales/fr";

type Translations = Record<TranslationKeys, string>;

const locales: Record<string, Translations> = {
    en: en as Translations,
    tr: tr as Translations,
    zh: zh as Translations,
    es: es as Translations,
    hi: hi as Translations,
    de: de as Translations,
    fr: fr as Translations,
};

/**
 * Get the translations object for a given language.
 * Falls back to English if the key is missing.
 */
export function getTranslation(lang: string): Translations {
    return locales[lang] || locales.en;
}

/**
 * Get a single translated string by key.
 */
export function t(lang: string, key: TranslationKeys): string {
    const translations = locales[lang] || locales.en;
    return translations[key] || (locales.en as Translations)[key] || key;
}

export type { TranslationKeys };
