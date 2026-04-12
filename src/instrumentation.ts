export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // HMR Protection: Prevent multiple intervals in Development Mode
        // Next.js Dev Server hot-reloads instrumentation.ts on every save.
        // If we don't bind a lock to the global scope (which persists across re-imports),
        // we'll memory leak hundreds of overlapping database connections.
        const globalNode = globalThis as typeof globalThis & { __cronInitialized?: boolean };

        if (!globalNode.__cronInitialized) {
            // Define exactly once
            globalNode.__cronInitialized = true;

            // Import the underlying DB-flushing service dynamically to prevent Edge collisions
            const { syncStatsFromRedisToDb } = await import('@/lib/statsSyncService');
            
            // PRE-WARMING (Cold Start Elimination)
            const { settingsService } = await import('@/lib/settingsService');
            const { languageService } = await import('@/lib/languageService');
            
            Promise.all([
                settingsService.getSettings([
                    "site_url", "site_name", "site_description", "site_keywords", "site_version", 
                    "site_logo_url", "site_favicon_url", "github_url", "bmc_url", "contact_email", 
                    "author_name", "author_url", "bmc_widget_enabled", "copyright_text", "copyright_year",
                    "default_lang", "default_theme", "theme_primary_color", "maintenanceMode"
                ]),
                languageService.getActiveLanguages()
            ]).catch(() => {});

            // Set background timer: 10 Minutes
            const SYNC_INTERVAL_MS = 10 * 60 * 1000;

            const timer = setInterval(async () => {
                try {
                    await syncStatsFromRedisToDb();
                } catch (error) {
                    console.error("[Instrumentation-Cron] Background Sync Error:", error);
                }
            }, SYNC_INTERVAL_MS);

            // Detach timer from Node event-loop keeping process forcefully alive
            if (timer.unref) {
                timer.unref();
            }
        }
    }
}
