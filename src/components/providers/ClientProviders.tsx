"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import { useOptWinStore } from "@/store/useOptWinStore";
import { WarningModal } from "@/components/modals/WarningModal";
import { RestorePointModal } from "@/components/modals/RestorePointModal";
import { ScriptOverlay } from "@/components/modals/ScriptOverlay";
import { Toast } from "@/components/modals/Toast";
import { Settings } from "lucide-react";

const LOADING_TEXT: Record<string, string> = {
    en: "Loading...", tr: "Yükleniyor...", de: "Wird geladen...",
    fr: "Chargement...", es: "Cargando...", zh: "加载中...", hi: "लोड हो रहा है...",
};

export function ClientProviders({ children }: { children: React.ReactNode }) {
    const theme = useOptWinStore((state) => state.theme);
    const lang = useOptWinStore((state) => state.lang);
    const loadTranslations = useOptWinStore((state) => state.loadTranslations);
    const [fadeOut, setFadeOut] = useState(false);

    // Detect client-side mount without setState in useEffect
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    // Load DB translations on mount and when language changes
    useEffect(() => {
        if (!mounted) return;
        loadTranslations(lang);
    }, [lang, mounted, loadTranslations]);

    useEffect(() => {
        // Enable smooth theme transitions AFTER initial paint to prevent FOUC
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.add("theme-ready");
            });
        });
    }, []);

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
    }, [theme, mounted]);

    useEffect(() => {
        if (!mounted) return;
        document.documentElement.lang = lang;
    }, [lang, mounted]);

    // Trigger fade-out once mounted, then remove loading overlay
    useEffect(() => {
        if (mounted) {
            // Small delay to ensure content is painted
            const timer = setTimeout(() => setFadeOut(true), 100);
            return () => clearTimeout(timer);
        }
    }, [mounted]);

    return (
        <>
            {/* Loading overlay — visible until hydration + initial render complete */}
            {!fadeOut ? (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--bg-color)]"
                    style={{ transition: "opacity 400ms ease" }}
                >
                    <div className="flex flex-col items-center gap-5">
                        <div className="animate-spin" style={{ animationDuration: "2s" }}>
                            <Settings size={56} className="text-[var(--accent-color)] opacity-35" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium text-[var(--text-secondary)] animate-pulse">
                            {LOADING_TEXT[lang] || LOADING_TEXT.en}
                        </p>
                    </div>
                </div>
            ) : null}

            {/* Fade-out transition overlay */}
            {fadeOut && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--bg-color)] pointer-events-none"
                    style={{
                        animation: "fadeOutOverlay 500ms ease forwards",
                    }}
                >
                    <div className="flex flex-col items-center gap-5">
                        <div className="animate-spin" style={{ animationDuration: "2s" }}>
                            <Settings size={56} className="text-[var(--accent-color)] opacity-35" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium text-[var(--text-secondary)] animate-pulse">
                            {LOADING_TEXT[lang] || LOADING_TEXT.en}
                        </p>
                    </div>
                </div>
            )}

            {/* Content — always rendered, hidden behind overlay until fade */}
            <div style={{ visibility: mounted ? "visible" : "hidden" }}>
                {children}
            </div>

            {/* All modals rendered at ROOT level for proper z-index stacking */}
            {mounted && (
                <>
                    <WarningModal />
                    <RestorePointModal />
                    <ScriptOverlay />
                    <Toast />
                </>
            )}
        </>
    );
}
