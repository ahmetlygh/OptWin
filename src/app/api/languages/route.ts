import { NextResponse } from "next/server";
import { languageService } from "@/lib/languageService";

export const dynamic = "force-dynamic";

// Public: Returns only active languages with flag SVG, name, code, utcOffset
export async function GET() {
    try {
        const languages = await languageService.getActiveLanguages();
        return NextResponse.json(languages, {
            headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            },
        });
    } catch (error) {
        console.error("[Languages API]", error);
        return NextResponse.json([], { status: 500 });
    }
}
