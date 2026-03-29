import { getTranslationsFromDb } from "@/lib/translations";
import { settingsService } from "@/lib/settingsService";
import { MaintenanceUI } from "@/components/layout/MaintenanceUI";

export default async function MaintenancePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Fetch all settings needed for maintenance page + footer in a single MGET
    const [translations, settings] = await Promise.all([
        getTranslationsFromDb(locale),
        settingsService.getSettings([
            "site_name", 
            "site_version",
            "site_logo_url",
            "site_favicon_url",
            "copyright_text", 
            "copyright_year", 
            "github_url",
            "contact_email",
            "author_name",
            "author_url",
            "maintenanceMode",
            "maintenanceReason",
            "maintenanceEstimatedEnd",
            "active_languages"
        ]),
    ]);

    const maintenanceActive = settings.maintenanceMode === "true";
    const reasonRaw = settings.maintenanceReason || "";
    const estimatedEndRaw = settings.maintenanceEstimatedEnd || null;

    // Parse safe reason with strict type-guarding
    let safeReason = "";
    
    if (typeof reasonRaw === "string") {
        if (reasonRaw.startsWith("{") && reasonRaw.endsWith("}")) {
            try {
                const parsed = JSON.parse(reasonRaw);
                const actualObj = typeof parsed === "string" ? JSON.parse(parsed) : parsed;
                safeReason = actualObj[locale] || actualObj.en || actualObj.tr || reasonRaw;
            } catch {
                safeReason = reasonRaw;
            }
        } else if (reasonRaw === "[object Object]" || !reasonRaw.trim()) {
            safeReason = "";
        } else {
            safeReason = reasonRaw;
        }
    } else if (reasonRaw && typeof reasonRaw === "object") {
        safeReason = (reasonRaw as any)[locale] || (reasonRaw as any).en || (reasonRaw as any).tr || "";
    } else {
        safeReason = "";
    }

    return (
        <MaintenanceUI 
            locale={locale}
            translations={translations}
            settings={settings}
            reason={safeReason}
            estimatedEnd={estimatedEndRaw || null}
            isActive={maintenanceActive}
        />
    );
}
