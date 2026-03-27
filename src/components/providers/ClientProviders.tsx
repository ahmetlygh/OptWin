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
