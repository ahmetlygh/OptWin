"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useOptWinStore } from "@/store/useOptWinStore";
import { WarningModal } from "@/components/modals/WarningModal";
import { RestorePointModal } from "@/components/modals/RestorePointModal";
import { ScriptOverlay } from "@/components/modals/ScriptOverlay";
import { Toast } from "@/components/modals/Toast";

export function ClientProviders({ children }: { children: React.ReactNode }) {
    const theme = useOptWinStore((state) => state.theme);
    const lang = useOptWinStore((state) => state.lang);

    // Detect client-side mount without setState in useEffect
    // useSyncExternalStore with getServerSnapshot=false, getSnapshot=true gives us a safe hydration-aware flag
    const mounted = useSyncExternalStore(
        () => () => {},    // subscribe: no-op (value never changes after mount)
        () => true,        // getSnapshot: always true on client
        () => false        // getServerSnapshot: false during SSR
    );

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

    if (!mounted) {
        return <div style={{ visibility: "hidden" }}>{children}</div>;
    }

    return (
        <>
            {children}
            {/* All modals rendered at ROOT level for proper z-index stacking */}
            <WarningModal />
            <RestorePointModal />
            <ScriptOverlay />
            <Toast />
        </>
    );
}
