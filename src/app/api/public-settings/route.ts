import { NextResponse } from "next/server";
import { settingsService } from "@/lib/settingsService";

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
    "site_logo_url",
    "site_favicon_url",
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
    "theme_primary_color",
];

export async function GET() {
    try {
        const map = await settingsService.getSettings(PUBLIC_KEYS);
        // Exclude undefined/null fields for backwards compatibility or simply send map
        const filteredMap = Object.fromEntries(
            Object.entries(map).filter(([_, val]) => val !== undefined && val !== null)
        );
        return NextResponse.json({ success: true, settings: filteredMap });
    } catch {
        return NextResponse.json({ success: false, settings: {} });
    }
}
