import { NextRequest, NextResponse } from "next/server";
import { settingsService } from "@/lib/settingsService";

export async function GET(req: NextRequest) {
    const pageSlug = req.nextUrl.searchParams.get("page");
    const lang = req.nextUrl.searchParams.get("lang") || "en";

    if (!pageSlug || !["privacy", "terms"].includes(pageSlug)) {
        return NextResponse.json({ error: "Invalid page" }, { status: 400 });
    }

    try {
        const key = pageSlug === "privacy" ? "privacy_policy_content" : "terms_content";
        const contentObj = await settingsService.getSetting(key);
        
        if (!contentObj) {
            return NextResponse.json([], { status: 200 });
        }

        const langContent = contentObj[lang] || contentObj["en"];
        
        if (!langContent || !langContent.sections) {
            return NextResponse.json([], { status: 200 });
        }
        
        const sections = langContent.sections.map((sec: any, idx: number) => ({
            sectionOrder: idx,
            title: sec.title,
            content: JSON.stringify(sec.content),
            disclaimer: langContent.disclaimer || null,
            lastUpdated: langContent.lastUpdated || ""
        }));

        return NextResponse.json(sections, {
            headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
        });
    } catch {
        return NextResponse.json([], { status: 500 });
    }
}
