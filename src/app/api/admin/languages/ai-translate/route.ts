import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        // Frontend sends: { targetLang, targetLangName, sourceLang, translations }
        // We ensure keysToTranslate are derived from body.translations
        const { targetLang, targetLangName, sourceLang, translations: referenceTranslations } = body;

        if (!targetLang || !referenceTranslations || typeof referenceTranslations !== 'object') {
            return NextResponse.json({ error: "Missing required parameters or invalid translations object" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY is not configured in .env" }, { status: 500 });
        }

        const keysToTranslate = Object.keys(referenceTranslations);
        if (keysToTranslate.length === 0) {
            return NextResponse.json({ translations: {} });
        }

        const targetName = targetLangName || targetLang;

        // Construct a prompt for Gemini
        const systemPrompt = `You are a professional software localization expert.
Task: Translate UI strings for a Windows Optimization tool.
Source Language: ${sourceLang || "Turkish"}
Target Language: ${targetName}
Requirements:
1. Return ONLY a valid JSON object.
2. Maintain all technical placeholders like {count}, {name}, etc.
3. Preserve the exact keys.
4. Do not wrap in markdown code blocks.`;

        // Using gemini-2.0-flash as it is more stable than non-existent 2.5
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{ text: systemPrompt + "\n\nTranslate this JSON:\n" + JSON.stringify(referenceTranslations, null, 2) }] }
                ],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.1
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            let errJson;
            try { errJson = JSON.parse(errText); } catch { errJson = { error: { message: errText } }; }
            throw new Error(`Gemini API Error: ${errJson.error?.message || response.statusText}`);
        }

        const data = await response.json();
        let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
            throw new Error("AI did not return any text content.");
        }

        // Strip markdown if AI ignored the instructions
        if (generatedText.includes("```")) {
            generatedText = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        let parsedTranslations;
        try {
            parsedTranslations = JSON.parse(generatedText);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", generatedText);
            throw new Error("AI returned invalid JSON structure.");
        }
        
        // Clean result: only return original keys
        const cleanedTranslations: Record<string, string> = {};
        for (const key of keysToTranslate) {
            if (parsedTranslations[key]) {
                cleanedTranslations[key] = parsedTranslations[key];
            }
        }

        return NextResponse.json({ success: true, translations: cleanedTranslations });
    } catch (error) {
        console.error("[AI Auto-Translate ERROR]", error);
        return NextResponse.json({ error: "AI translation failed", details: (error as Error).message }, { status: 500 });
    }
}
