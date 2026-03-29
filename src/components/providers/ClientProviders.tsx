"use client";

import { useEffect, useSyncExternalStore, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useOptWinStore, Lang } from "@/store/useOptWinStore";
import { WarningModal } from "@/components/modals/WarningModal";
import { RestorePointModal } from "@/components/modals/RestorePointModal";
import { ScriptOverlay } from "@/components/modals/ScriptOverlay";
import { Toast } from "@/components/modals/Toast";

const LOCALES = ['en', 'tr', 'de', 'fr', 'es', 'zh', 'hi'];

interface ClientProvidersProps {
    children: React.ReactNode;
    serverSettings?: Record<string, string>;
    initialTranslations?: Record<string, string>;
}

export function ClientProviders({ children, serverSettings = {}, initialTranslations }: ClientProvidersProps) {
    const theme = useOptWinStore((state) => state.theme);
    const lang = useOptWinStore((state) => state.lang);
    const setLang = useOptWinStore((state) => state.setLang);
    const loadTranslations = useOptWinStore((state) => state.loadTranslations);

    // Initial injection of SSR-fetched translations into Zustand
    const hasInitialInjected = useRef(false);
    if (initialTranslations && !hasInitialInjected.current) {
        useOptWinStore.setState({ 
            dbTranslations: initialTranslations, 
            translationsLoaded: true,
            activeLangRequest: lang 
        });
        hasInitialInjected.current = true;
    }

    const pathname = usePathname();

    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    // Sync Zustand with URL locale if they differ
    useEffect(() => {
        if (!mounted || !pathname) return;
        const segments = pathname.split('/');
        if (segments.length > 1 && LOCALES.includes(segments[1])) {
            const urlLocale = segments[1] as Lang;
            if (lang !== urlLocale) setLang(urlLocale);
        }
    }, [mounted, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    // Secondary translation load only when language changes client-side
    useEffect(() => {
        if (!mounted) return;
        loadTranslations(lang);
    }, [lang, mounted, loadTranslations]);

    // Theme & Class injection
    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
            root.classList.remove("light");
        } else {
            root.classList.add("light");
            root.classList.remove("dark");
        }
        document.body.classList.add("theme-ready");
    }, [theme, mounted]);

    useEffect(() => {
        if (!mounted) return;
        document.documentElement.lang = lang;
    }, [lang, mounted]);

    // ── Unified SSE: Single listener handles BOTH directions ──
    // ON → redirect to /maintenance (if on public page)
    // OFF → redirect to /home (if on maintenance page)
    const prevMaintenanceGlobal = useRef<boolean | null>(null);
    const sseRedirectFired = useRef(false);

    useEffect(() => {
        if (!mounted) return;

        // Don't run SSE on admin pages
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/admin')) return;

        const es = new EventSource("/api/maintenance/stream");

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (typeof data.maintenance !== "boolean") return;

                const newState = data.maintenance;
                const prevState = prevMaintenanceGlobal.current;

                // Store current state for next comparison
                prevMaintenanceGlobal.current = newState;

                // First message: just establish baseline, don't redirect
                // (proxy already handled the initial page load correctly)
                if (prevState === null) return;

                // Prevent multiple redirects
                if (sseRedirectFired.current) return;

                const livePath = window.location.pathname;
                const segments = livePath.split('/');
                const pathLocale = (segments.length > 1 && LOCALES.includes(segments[1])) ? segments[1] : 'en';
                const isOnMaintenancePage = segments.some(s => s === 'maintenance');

                // Case 1: Maintenance just turned ON → redirect to maintenance page
                if (prevState === false && newState === true && !isOnMaintenancePage) {
                    sseRedirectFired.current = true;
                    window.location.replace(`/${pathLocale}/maintenance`);
                    return;
                }

                // Case 2: Maintenance just turned OFF → redirect to home page
                if (prevState === true && newState === false && isOnMaintenancePage) {
                    sseRedirectFired.current = true;
                    window.location.replace(`/${pathLocale}`);
                    return;
                }
            } catch { /* ignore parse errors */ }
        };

        es.onerror = () => {
            // On SSE connection error, try to reconnect after a delay
            // The browser's EventSource auto-reconnects, so we just log
            console.warn("[OptWin SSE] Connection error, auto-reconnecting...");
        };

        return () => {
            es.close();
            // Reset redirect guard on unmount so it works on remount
            sseRedirectFired.current = false;
        };
    }, [mounted]);

    return (
        <>
            {/* 
              Zero-FOUC Implementation: 
              We no longer use artificial hydration timers or fullscreen loaders. 
              Translations are delivered via initialTranslations (SSR) and injected 
              directly into the store state during the first render.
            */}
            <div className="min-h-screen">
                {children}
            </div>

            {mounted && (
                <>
                    <WarningModal />
                    <RestorePointModal />
                    <ScriptOverlay serverSettings={serverSettings} />
                    <Toast />
                </>
            )}
        </>
    );
}
