import { getTranslationsFromDb } from "@/lib/translations";
import { settingsService } from "@/lib/settingsService";
import { MaintenanceUI } from "@/components/layout/MaintenanceUI";
import { redisCache } from "@/lib/redis";

export default async function MaintenancePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Fetch static details for the page
    const [translations, settings, maintenanceActive, reasonRaw, estimatedEndRaw] = await Promise.all([
        getTranslationsFromDb(locale),
        settingsService.getSettings(["site_name", "copyright_text", "copyright_year"]),
        redisCache.get("optwin:setting:maintenanceMode"),
        redisCache.get("optwin:setting:maintenanceReason"),
        redisCache.get("optwin:setting:maintenanceEstimatedEnd"),
    ]);

    // Parse safe reason
    let safeReason = "";
    if (reasonRaw) {
        try {
            const parsed = JSON.parse(reasonRaw);
            safeReason = parsed[locale] || parsed.en || parsed.tr || "";
        } catch {
            safeReason = reasonRaw;
        }
    }

    return (
        <MaintenanceUI 
            locale={locale}
            translations={translations}
            settings={settings}
            reason={safeReason}
            estimatedEnd={estimatedEndRaw || null}
            isActive={maintenanceActive === "true"}
        />
    );
}
