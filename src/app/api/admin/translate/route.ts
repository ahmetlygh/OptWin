import { NextResponse } from "next/server";
import { checkAdmin, unauthorizedResponse } from "@/lib/admin-guard";

// Language codes for different APIs
const LANG_CODES: Record<string, string> = {
    en: "en", tr: "tr", de: "de", fr: "fr", es: "es", zh: "zh-CN", hi: "hi",
};

/**
 * Helper to match the case of the translated text with the source text.
 */
function matchCase(source: string, target: string): string {
    if (!source || !target) return target;
    
    // 1. ALL UPPERCASE (e.g. "HELLO" -> "MERHABA")
    if (source === source.toUpperCase() && source !== source.toLowerCase()) {
        return target.toUpperCase();
    }
    
    // 2. Title Case / Capitalized (e.g. "Hello" -> "Merhaba")
    // Check if first char is upper and rest has some lower or it's just one char
    const firstChar = source[0];
    if (firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase()) {
        return target.charAt(0).toUpperCase() + target.slice(1);
    }
    
    // 3. all lowercase (e.g. "hello" -> "merhaba")
    if (source === source.toLowerCase() && source !== source.toUpperCase()) {
        return target.toLowerCase();
    }
    
    return target;
}

// Primary: Google Translate (unofficial, free, better quality)
async function translateWithGoogle(text: string, source: string, target: string): Promise<string | null> {
    try {
        const sl = LANG_CODES[source] || source;
        const tl = LANG_CODES[target] || target;
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) return null;
        const data = await res.json();
        // Response format: [[["translated text","original text",null,null,N]],null,"en"]
        if (Array.isArray(data) && Array.isArray(data[0])) {
            return data[0].map((seg: string[]) => seg[0]).join("");
        }
        return null;
    } catch {
        return null;
    }
}

// Fallback: MyMemory Translation API
async function translateWithMyMemory(text: string, source: string, target: string): Promise<string | null> {
    try {
        const sl = LANG_CODES[source] || source;
        const tl = LANG_CODES[target] || target;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sl}|${tl}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
            return data.responseData.translatedText;
        }
        return null;
    } catch {
        return null;
    }
}

async function translateText(text: string, source: string, target: string): Promise<string | null> {
    // Try Google first, then MyMemory as fallback
    const result = await translateWithGoogle(text, source, target);
    const finalResult = result || (await translateWithMyMemory(text, source, target));
    
    if (finalResult) {
        return matchCase(text, finalResult);
    }
    
    return null;
}

export async function POST(req: Request) {
    if (!(await checkAdmin())) return unauthorizedResponse();

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

        const results: Record<string, string> = {};
        const translatedLangs: string[] = [];

        await Promise.all(
            targetLangs.map(async (lang) => {
                if (lang === sourceLang) return;
                try {
                    const translated = await translateText(text, sourceLang, lang);
                    if (translated) {
                        results[lang] = translated;
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
