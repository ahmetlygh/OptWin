/**
 * Converts a string to PowerShell-safe ASCII by replacing
 * unsupported characters (Turkish, accented, CJK, etc.)
 */
const CHAR_MAP: Record<string, string> = {
    // Turkish
    "ş": "s", "Ş": "S",
    "ı": "i", "İ": "I",
    "ğ": "g", "Ğ": "G",
    "ü": "u", "Ü": "U",
    "ö": "o", "Ö": "O",
    "ç": "c", "Ç": "C",
    // German
    "ä": "a", "Ä": "A",
    "ß": "ss",
    // French / Spanish / Portuguese
    "é": "e", "è": "e", "ê": "e", "ë": "e",
    "É": "E", "È": "E", "Ê": "E", "Ë": "E",
    "à": "a", "â": "a", "á": "a", "ã": "a",
    "À": "A", "Â": "A", "Á": "A", "Ã": "A",
    "ù": "u", "û": "u", "ú": "u",
    "Ù": "U", "Û": "U", "Ú": "U",
    "î": "i", "ï": "i", "í": "i",
    "Î": "I", "Ï": "I", "Í": "I",
    "ô": "o", "ó": "o", "õ": "o",
    "Ô": "O", "Ó": "O", "Õ": "O",
    "ñ": "n", "Ñ": "N",
    "ÿ": "y", "Ÿ": "Y",
    "ý": "y", "Ý": "Y",
    // Polish
    "ą": "a", "Ą": "A",
    "ć": "c", "Ć": "C",
    "ę": "e", "Ę": "E",
    "ł": "l", "Ł": "L",
    "ń": "n", "Ń": "N",
    "ś": "s", "Ś": "S",
    "ź": "z", "Ź": "Z",
    "ż": "z", "Ż": "Z",
    // Czech / Slovak / Romanian
    "ř": "r", "Ř": "R",
    "ž": "z", "Ž": "Z",
    "ě": "e", "Ě": "E",
    "ď": "d", "Ď": "D",
    "ť": "t", "Ť": "T",
    "ň": "n", "Ň": "N",
    "ă": "a", "Ă": "A",
    "ț": "t", "Ț": "T",
    "ș": "s", "Ș": "S",
};

/**
 * Escape a string for use inside PowerShell double-quoted strings.
 * Backtick-escapes: `  "  $
 */
export function escapeForPsString(text: string): string {
    return text
        .replace(/`/g, "``")
        .replace(/"/g, '`"')
        .replace(/\$/g, "`$");
}

export function toPowerShellSafe(text: string): string {
    let result = "";
    for (const char of text) {
        if (CHAR_MAP[char]) {
            result += CHAR_MAP[char];
        } else if (char.charCodeAt(0) > 127) {
            // Non-ASCII char not in map — skip or replace with space
            result += "";
        } else {
            result += char;
        }
    }
    // Collapse multiple spaces, then escape for PS double-quoted strings
    return escapeForPsString(result.replace(/\s{2,}/g, " ").trim());
}

/**
 * Generates an auto script message for a given feature title + lang
 * e.g. "Merhaba" (tr) → "Merhaba islemi yapiliyor"
 * e.g. "Clean Temp" (en) → "Applying Clean Temp"
 */
const SUFFIX_MAP: Record<string, string> = {
    tr: "islemi yapiliyor",
    en: "is being applied",
    de: "wird angewendet",
    fr: "est en cours",
    es: "se esta aplicando",
    zh: "is being applied",
    hi: "is being applied",
};

export function generateScriptMessage(title: string, lang: string): string {
    if (!title.trim()) return "";
    const safeTitle = toPowerShellSafe(title);
    const suffix = SUFFIX_MAP[lang] || SUFFIX_MAP.en;
    return `${safeTitle} ${suffix}`;
}
