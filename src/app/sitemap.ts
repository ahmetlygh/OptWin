import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const PAGES = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://optwin.tech";

    // Fetch active languages from database
    let locales: string[] = ["en", "tr"];
    try {
        const languages = await prisma.language.findMany({
            where: { isActive: true },
            select: { code: true },
        });
        if (languages.length > 0) {
            locales = languages.map((l) => l.code);
        }
    } catch {
        // Fallback to defaults if DB is unavailable
    }

    const now = new Date();
    const entries: MetadataRoute.Sitemap = [];

    for (const page of PAGES) {
        for (const locale of locales) {
            entries.push({
                url: `${baseUrl}/${locale}${page.path}`,
                lastModified: now,
                changeFrequency: page.changeFrequency,
                priority: page.priority,
            });
        }
    }

    return entries;
}
