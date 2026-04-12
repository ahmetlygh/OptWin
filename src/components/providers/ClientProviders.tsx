"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useOptWinStore, Lang } from "@/store/useOptWinStore";
import { WarningModal } from "@/components/modals/WarningModal";
import { RestorePointModal } from "@/components/modals/RestorePointModal";
import { ScriptOverlay } from "@/components/modals/ScriptOverlay";
import { Toast } from "@/components/modals/Toast";
import { ChangingLocaleLoader } from "@/components/layout/ChangingLocaleLoader";

const FALLBACK_LOCALES = ['en', 'tr', 'de', 'fr', 'es', 'zh', 'hi'];

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
    const isChangingLocale = useOptWinStore((state) => state.isChangingLocale);
    const setIsChangingLocale = useOptWinStore((state) => state.setIsChangingLocale);

    // Initial injection of SSR-fetched translations into Zustand — moved to useLayoutEffect
    // to avoid store mutation during render (React concurrent mode safe)
    const hasInitialInjected = useRef(false);
    useLayoutEffect(() => {
        if (initialTranslations && !hasInitialInjected.current) {
            useOptWinStore.setState({ 
                dbTranslations: initialTranslations, 
                translationsLoaded: true,
                activeLangRequest: lang 
            });
            hasInitialInjected.current = true;
        }
    }, [initialTranslations, lang]);

    const pathname = usePathname();

    // Dynamic locale list from server-injected language data
    const locales = (() => {
        try {
            if (serverSettings._languagesData) {
                const langs = JSON.parse(serverSettings._languagesData);
                if (Array.isArray(langs) && langs.length > 0) return langs.map((l: any) => l.code as string);
            }
        } catch { /* ignore */ }
        return FALLBACK_LOCALES;
    })();

    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    // Sync Zustand with URL locale if they differ
    useEffect(() => {
        if (!mounted || !pathname) return;
        const segments = pathname.split('/');
        if (segments.length > 1 && locales.includes(segments[1])) {
            const urlLocale = segments[1] as Lang;
            if (lang !== urlLocale) setLang(urlLocale);
        }
    }, [mounted, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    // Secondary translation load only when language changes client-side
    useEffect(() => {
        if (!mounted) return;
        loadTranslations(lang);
    }, [lang, mounted, loadTranslations]);

    // Theme & Class injection + Hydration signal
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
        // Signal splash screen that React has hydrated
        window.dispatchEvent(new Event('optwin:hydrated'));
    }, [theme, mounted]);

    useEffect(() => {
        if (!mounted) return;
        document.documentElement.lang = lang;

        // Task: When pathname segments match current lang, we consider navigation finished.
        // We add a tiny delay to ensure React has painted the new translated state.
        if (isChangingLocale && pathname) {
            const segments = pathname.split('/');
            if (segments.length > 1 && segments[1] === lang) {
                const timer = setTimeout(() => {
                    setIsChangingLocale(false);
                }, 500); // Fluidity delay for premium feel
                return () => clearTimeout(timer);
            }
        }
    }, [lang, mounted, pathname, isChangingLocale, setIsChangingLocale]);

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

        let es: EventSource | null = null;
        let reconnectTimer: NodeJS.Timeout;

        const connectSSE = () => {
            if (!mounted) return;
            es = new EventSource("/api/maintenance/stream");

            es.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (typeof data.maintenance !== "boolean") return;

                    const newState = data.maintenance;
                    const prevState = prevMaintenanceGlobal.current;
                    prevMaintenanceGlobal.current = newState;

                    if (prevState === null || sseRedirectFired.current) return;

                    const livePath = window.location.pathname;
                    const segments = livePath.split('/');
                    const pathLocale = (segments.length > 1 && locales.includes(segments[1])) ? segments[1] : 'en';
                    const isOnMaintenancePage = segments.some(s => s === 'maintenance');

                    if (prevState === false && newState === true && !isOnMaintenancePage) {
                        sseRedirectFired.current = true;
                        window.location.replace(`/${pathLocale}/maintenance`);
                    } else if (prevState === true && newState === false && isOnMaintenancePage) {
                        sseRedirectFired.current = true;
                        window.location.replace(`/${pathLocale}`);
                    }
                } catch { /* ignore */ }
            };

            es.onerror = () => {
                console.debug("[SSE] Reconnecting...");
                if (es) {
                    es.close();
                    es = null;
                }
                reconnectTimer = setTimeout(connectSSE, 5000);
            };
        };

        connectSSE();

        return () => {
            if (es) es.close();
            clearTimeout(reconnectTimer);
            sseRedirectFired.current = false;
        };
    }, [mounted]);

    return (
        <div className="select-none">
            <ChangingLocaleLoader />
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
        </div>
    );
}
