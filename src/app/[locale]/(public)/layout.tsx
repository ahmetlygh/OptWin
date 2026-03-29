import { PublicShell } from "@/components/layout/PublicShell";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getTranslationsFromDb } from "@/lib/translations";
import { languageService } from "@/lib/languageService";

export default async function PublicLayout({
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

    const [session, settings, activeLanguages] = await Promise.all([
        auth(),
        getSettings(PUBLIC_KEYS),
        languageService.getActiveLanguages(),
    ]);

    const initialTranslations = await getTranslationsFromDb(locale);
    
    // Inject serialized language data into settings so child components can access it
    settings._languagesData = JSON.stringify(activeLanguages);
    const adminSession = session?.isAdmin ? {
        name: session.user?.name || null,
        image: session.user?.image || null,
    } : null;

    // Fetch maintenance mode state dynamically to prevent Zombie UI
    const maintenanceActive = settings.maintenanceMode === "true";

    return (
        <ClientProviders serverSettings={settings} initialTranslations={initialTranslations}>
            <PublicShell serverMaintenance={maintenanceActive} adminSession={adminSession} serverSettings={settings}>
                {children}
            </PublicShell>
        </ClientProviders>
    );
}
