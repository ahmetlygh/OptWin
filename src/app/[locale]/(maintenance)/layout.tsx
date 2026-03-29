import { ClientProviders } from "@/components/providers/ClientProviders";
import { getSettings } from "@/lib/settings";
import { getTranslationsFromDb } from "@/lib/translations";

export default async function MaintenanceLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const { locale } = await params;

    const PUBLIC_KEYS = [
        "site_url", "site_name", "site_description", "site_keywords", "site_version",
        "site_logo_url", "site_favicon_url", "github_url", "bmc_url", "contact_email",
        "author_name", "author_url", "bmc_widget_enabled", "copyright_text", "copyright_year",
        "default_lang", "default_theme", "theme_primary_color", "maintenanceMode"
    ];

    const [settings, initialTranslations] = await Promise.all([
        getSettings(PUBLIC_KEYS),
        getTranslationsFromDb(locale),
    ]);

    return (
        <ClientProviders serverSettings={settings} initialTranslations={initialTranslations}>
            {children}
        </ClientProviders>
    );
}
