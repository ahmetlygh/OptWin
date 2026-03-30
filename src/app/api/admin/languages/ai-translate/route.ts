import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { redisCache } from "@/lib/redis";

// Task 2: AI Budget Guard (Rate Limiting Logic)
const RATE_LIMIT_WINDOW = 3600; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 20; // Max 20 auto-translate batches per hour per admin
const KEY_PREFIX = "optwin:ratelimit:ai-translate:";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Task 1: Environment Variable Validation (Backend)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ 
            error: "Gemini API anahtarı (.env) eksik. Lütfen yapılandırmanızı kontrol edin." 
        }, { status: 400 });
    }

    const adminEmail = session.user?.email || "unknown";
    const rateLimitKey = `${KEY_PREFIX}${adminEmail}`;

    try {
        // Rate Limiting Check
        const currentRequests = await redisCache.get(rateLimitKey);
        const count = currentRequests ? parseInt(currentRequests) : 0;

        if (count >= MAX_REQUESTS_PER_WINDOW) {
            return NextResponse.json({ 
                error: "AI Çeviri limiti aşıldı. Lütfen bir saat sonra tekrar deneyin.",
                limitReached: true 
            }, { 
                status: 429,
                headers: { "Retry-After": "3600" }
            });
        }

        const body = await request.json();
        const { targetLang, sourceLang, translations: referenceTranslations } = body;

        if (!targetLang || !referenceTranslations || typeof referenceTranslations !== 'object') {
            return NextResponse.json({ error: "Eksik parametre veya geçersiz çeviri objesi." }, { status: 400 });
        }

        const keysToTranslate = Object.keys(referenceTranslations);
        if (keysToTranslate.length === 0) return NextResponse.json({ translations: {} });

        // Increment rate limit counter
        if (count === 0) {
            await redisCache.set(rateLimitKey, "1", RATE_LIMIT_WINDOW);
        } else {
            await redisCache.incr(rateLimitKey);
        }

        const systemPrompt = `You are a professional software localization expert.
Task: Translate UI strings for a Windows Optimization tool.
Source Language: ${sourceLang || "Turkish"}
Target Language: ${targetLang}
Requirements:
1. Return ONLY a valid JSON object.
2. Maintain all technical placeholders like {count}, {name}, etc.
3. Preserve the exact keys.
4. Do not wrap in markdown code blocks.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{ text: systemPrompt + "\n\nTranslate this JSON:\n" + JSON.stringify(referenceTranslations, null, 2) }] }
                ],
                generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini API Error: ${errText}`);
        }

        const data = await response.json();
        let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) throw new Error("AI yanıt dönmedi.");
        if (generatedText.includes("```")) generatedText = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();

        let parsedTranslations;
        try {
            parsedTranslations = JSON.parse(generatedText);
        } catch (e) {
            throw new Error("AI geçersiz JSON döndü.");
        }
        
        const cleanedTranslations: Record<string, string> = {};
        for (const key of keysToTranslate) {
            if (parsedTranslations[key]) cleanedTranslations[key] = parsedTranslations[key];
        }

        return NextResponse.json({ success: true, translations: cleanedTranslations });
    } catch (error) {
        console.error("[AI Auto-Translate ERROR]", error);
        return NextResponse.json({ error: "AI çevirisi başarısız oldu.", details: (error as Error).message }, { status: 500 });
    }
}
