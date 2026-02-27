"use client";

import { useEffect, useState } from "react";
import { useOptWinStore } from "@/store/useOptWinStore";
import { WarningModal } from "@/components/modals/WarningModal";
import { RestorePointModal } from "@/components/modals/RestorePointModal";
import { ScriptOverlay } from "@/components/modals/ScriptOverlay";
import { Toast } from "@/components/modals/Toast";

export function ClientProviders({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const theme = useOptWinStore((state) => state.theme);
    const lang = useOptWinStore((state) => state.lang);

    // Re-hydrate state from localStorage on mount and apply to DOM
    useEffect(() => {
        setMounted(true);
    }, []);

    // Update theme class on HTML element
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

    // Update language attribute on HTML element
    useEffect(() => {
        if (!mounted) return;
        document.documentElement.lang = lang;
    }, [lang, mounted]);

    // Prevent flash of unstyled content
    if (!mounted) {
        return <div style={{ visibility: "hidden" }}>{children}</div>;
    }

    return (
        <>
            {children}
            <WarningModal />
            <RestorePointModal />
            <ScriptOverlay />
            <Toast />
        </>
    );
}
