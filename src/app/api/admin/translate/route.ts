import { NextResponse } from "next/server";

// MyMemory Translation API — free, no API key required
const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

// Language codes mapping for MyMemory
const LANG_CODES: Record<string, string> = {
    en: "en",
    tr: "tr",
    de: "de",
    fr: "fr",
    es: "es",
    zh: "zh-CN",
    hi: "hi",
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text, sourceLang, targetLangs } = body as {
            text: string;
            sourceLang: string;
            targetLangs: string[];
        };

        if (!text || !sourceLang || !targetLangs || !Array.isArray(targetLangs)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const sourceCode = LANG_CODES[sourceLang] || sourceLang;
        const results: Record<string, string> = {};
        const translatedLangs: string[] = [];

        await Promise.all(
            targetLangs.map(async (lang) => {
                if (lang === sourceLang) return;
                const targetCode = LANG_CODES[lang] || lang;
                try {
                    const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=${sourceCode}|${targetCode}`;
                    const res = await fetch(url);
                    const data = await res.json();
                    if (data.responseStatus === 200 && data.responseData?.translatedText) {
                        results[lang] = data.responseData.translatedText;
                        translatedLangs.push(lang);
                    }
                } catch {
                    // Skip failed translations silently
                }
            })
        );

        return NextResponse.json({
            success: true,
            translations: results,
            translatedLangs,
        });
    } catch {
        return NextResponse.json({ error: "Translation failed" }, { status: 500 });
    }
}
