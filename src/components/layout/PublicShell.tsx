"use client";

import { usePathname } from "next/navigation";
import { useOptWinStore } from "@/store/useOptWinStore";
import Script from "next/script";
import { useTranslation } from "@/i18n/useTranslation";
import { Header } from "./Header";
import { Footer } from "./Footer";

import { SupportModal } from "@/components/modals/SupportModal";
import { ScrollToTop } from "./ScrollToTop";
import { ScrollRestorer } from "@/components/shared/ScrollRestorer";

/* ── Ambient Background ──────────────────────────────────────── */
function AmbientBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] bg-(--bg-color)">
            <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-[radial-gradient(circle,rgba(107,91,230,0.12)_0%,transparent_70%)]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.12)_0%,transparent_70%)]"></div>
            <div className="absolute top-[40%] left-[30%] w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_70%)]"></div>
        </div>
    );
}

/* ── Public Shell ─────────────────────────────────────────────── */
export function PublicShell({ children, serverMaintenance = false, adminSession = null, serverSettings = {} }: { children: React.ReactNode; serverMaintenance?: boolean; adminSession?: { name: string | null; image: string | null } | null; serverSettings?: Record<string, string> }) {
    const { t } = useTranslation();
    const { lang } = useOptWinStore();
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");

    // SSE is now handled exclusively by ClientProviders (unified listener)
    // No duplicate SSE connections needed here

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <>
            <AmbientBackground />

            <div className="flex flex-col min-h-screen relative">
                <Header adminSession={adminSession} serverSettings={serverSettings} />
                <main className="flex-1 w-full max-w-[1440px] mx-auto pt-6 pb-12 px-6">
                    {children}
                </main>
                <Footer serverSettings={serverSettings} />
            </div>

            <SupportModal serverSettings={serverSettings} />
            <ScrollToTop />
            <ScrollRestorer />

            {/* Buy Me a Coffee Widget (Inject only if enabled) */}
            {serverSettings.bmc_widget_enabled === "true" && serverSettings.bmc_url && (
                <Script
                    key={`bmc-widget-${t["support.widgetMessage"] || lang}`}
                    src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
                    data-name="BMC-Widget"
                    data-cfasync="false"
                    data-id={serverSettings.bmc_url.split("/").pop()}
                    data-description="Support our project!"
                    data-message={t["support.widgetMessage"] || "Özgür yazılıma destek olmak ister misiniz?"}
                    data-color="#6c5ce7"
                    data-position="Right"
                    data-x_margin="18"
                    data-y_margin="18"
                    strategy="afterInteractive"
                />
            )}
        </>
    );
}

