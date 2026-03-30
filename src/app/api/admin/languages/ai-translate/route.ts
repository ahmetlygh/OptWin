import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Language nativeName / displayName to ISO 639-1 code mapping
const LANG_CODE_MAP: Record<string, string> = {
    // Native names
    "türkçe": "tr", "english": "en", "deutsch": "de", "français": "fr",
    "español": "es", "中文": "zh", "हिन्दी": "hi", "português": "pt",
    "italiano": "it", "русский": "ru", "日本語": "ja", "한국어": "ko",
    "arabic": "ar", "عربي": "ar", "polski": "pl", "nederlands": "nl",
    // ISO codes (pass-through)
    "tr": "tr", "en": "en", "de": "de", "fr": "fr", "es": "es",
    "zh": "zh", "hi": "hi", "pt": "pt", "pt-br": "pt-br", "it": "it",
    "ru": "ru", "ja": "ja", "ko": "ko", "ar": "ar", "pl": "pl", "nl": "nl",
};

const SEP = " ||NT|| ";
const CHUNK_CHAR_LIMIT = 450; // MyMemory limit is ~500 chars per request

function resolveIsoCode(lang: string): string {
    return LANG_CODE_MAP[lang.toLowerCase()] || lang.toLowerCase().slice(0, 2);
}

function chunkArray<T>(arr: T[], charLimit: number, getValue: (item: T) => string): T[][] {
    const chunks: T[][] = [];
    let current: T[] = [];
    let currentLen = 0;

    for (const item of arr) {
        const len = getValue(item).length + SEP.length;
        if (current.length > 0 && currentLen + len > charLimit) {
            chunks.push(current);
            current = [];
            currentLen = 0;
        }
        current.push(item);
        currentLen += len;
    }
    if (current.length > 0) chunks.push(current);
    return chunks;
}

async function translateChunk(texts: string[], sourceLang: string, targetLang: string): Promise<string[]> {
    const joined = texts.join(SEP);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(joined)}&langpair=${sourceLang}|${targetLang}`;

    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error(`MyMemory API hatası: HTTP ${res.status}`);

    const data = await res.json();
    if (data.responseStatus !== 200) {
        throw new Error(`MyMemory API hatası: ${data.responseDetails || "Bilinmeyen hata"}`);
    }

    const translatedText: string = data.responseData?.translatedText || "";
    const parts = translatedText.split(SEP);

    // Ensure we always return same length as input
    const result: string[] = [];
    for (let i = 0; i < texts.length; i++) {
        result.push(parts[i]?.trim() || texts[i]);
    }
    return result;
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const targetLang = body.targetLang || body.targetLanguage;
        const sourceLang = body.sourceLang || "en";
        const referenceTranslations = body.translations || body.keys;

        if (
            !targetLang ||
            !referenceTranslations ||
            typeof referenceTranslations !== "object" ||
            Array.isArray(referenceTranslations) ||
            referenceTranslations === null
        ) {
            return NextResponse.json({ error: "Eksik parametre veya geçersiz çeviri objesi." }, { status: 400 });
        }

        const pairs = Object.entries(referenceTranslations as Record<string, string>);
        if (pairs.length === 0) return NextResponse.json({ translations: {} });

        const sourceIso = resolveIsoCode(sourceLang);
        const targetIso = resolveIsoCode(targetLang);

        if (sourceIso === targetIso) {
            // Same language — just mirror
            const mirror: Record<string, string> = {};
            for (const [k, v] of pairs) mirror[k] = v;
            return NextResponse.json({ success: true, translations: mirror });
        }

        // Split into chunks that respect MyMemory's ~500 char limit
        const chunks = chunkArray(pairs, CHUNK_CHAR_LIMIT, ([, v]) => v);

        const translatedPairs: Record<string, string> = {};

        for (const chunk of chunks) {
            const keys = chunk.map(([k]) => k);
            const values = chunk.map(([, v]) => v);

            let results: string[];
            try {
                results = await translateChunk(values, sourceIso, targetIso);
            } catch (err) {
                console.error("TRANSLATE_CHUNK_ERROR:", err);
                // On chunk failure, keep original values for that chunk
                results = values;
            }

            for (let i = 0; i < keys.length; i++) {
                translatedPairs[keys[i]] = results[i];
            }

            // Polite delay between chunks to avoid IP rate limiting
            if (chunks.length > 1) {
                await new Promise((r) => setTimeout(r, 300));
            }
        }

        return NextResponse.json({ success: true, translations: translatedPairs });
    } catch (error) {
        console.error("TRANSLATE_API_ERROR:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Bilinmeyen sunucu hatası" },
            { status: 500 }
        );
    }
}
