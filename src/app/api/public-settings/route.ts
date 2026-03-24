import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/public-settings — public endpoint to fetch non-sensitive site settings
 * Used by Footer, Header, and other public components to read dynamic settings
 */
const PUBLIC_KEYS = [
    "site_url",
    "site_name",
    "site_description",
    "site_keywords",
    "site_version",
    "github_url",
    "bmc_url",
    "contact_email",
    "author_name",
    "author_url",
    "bmc_widget_enabled",
    "copyright_text",
    "copyright_year",
    "default_lang",
    "default_theme",
];

export async function GET() {
    try {
        const settings = await prisma.siteSetting.findMany({
            where: { key: { in: PUBLIC_KEYS } },
        });
        const map: Record<string, string> = {};
        settings.forEach(s => { map[s.key] = s.value; });
        return NextResponse.json({ success: true, settings: map });
    } catch {
        return NextResponse.json({ success: true, settings: {} });
    }
}
