import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

/**
 * GET /api/page-content?page=privacy&lang=en
 * Returns page sections ordered by sectionOrder for the given page and language.
 * Falls back to English if no content exists for the requested language.
 */

const getPageContent = unstable_cache(
    async (pageSlug: string, lang: string) => {
        // Try requested language
        let sections = await prisma.pageContent.findMany({
            where: { pageSlug, lang },
            orderBy: { sectionOrder: "asc" },
            select: {
                sectionOrder: true,
                title: true,
                content: true,
                disclaimer: true,
                lastUpdated: true,
            },
        });

        // Fallback to English if no content for requested language
        if (sections.length === 0 && lang !== "en") {
            sections = await prisma.pageContent.findMany({
                where: { pageSlug, lang: "en" },
                orderBy: { sectionOrder: "asc" },
                select: {
                    sectionOrder: true,
                    title: true,
                    content: true,
                    disclaimer: true,
                    lastUpdated: true,
                },
            });
        }

        return sections;
    },
    ["page-content"],
    { revalidate: 60, tags: ["page-content"] }
);

export async function GET(req: NextRequest) {
    const pageSlug = req.nextUrl.searchParams.get("page");
    const lang = req.nextUrl.searchParams.get("lang") || "en";

    if (!pageSlug || !["privacy", "terms"].includes(pageSlug)) {
        return NextResponse.json({ error: "Invalid page" }, { status: 400 });
    }

    try {
        const sections = await getPageContent(pageSlug, lang);
        return NextResponse.json(sections, {
            headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
        });
    } catch {
        return NextResponse.json([], { status: 500 });
    }
}
