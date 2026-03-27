"use client";

import { createContext, useContext, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UnsavedChangesModal } from "./UnsavedChangesModal";

type UnsavedChangesContextType = {
    hasUnsavedChanges: boolean;
    setHasUnsavedChanges: (v: boolean) => void;
    onSave: React.MutableRefObject<(() => Promise<void>) | null>;
    onDiscard: React.MutableRefObject<(() => void) | null>;
    openModal: (navFn: () => void) => void;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextType>({
    hasUnsavedChanges: false,
    setHasUnsavedChanges: () => {},
    onSave: { current: null },
    onDiscard: { current: null },
    openModal: () => {},
});

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const onSave = useRef<(() => Promise<void>) | null>(null);
    const onDiscard = useRef<(() => void) | null>(null);

    // Modal navigation state
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);

    // 1. Intercept Browser Exit (F5, Tab Close)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "";
                return "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);

    /**
     * openModal is the manual trigger for pages that use their own navigation
     * logic (e.g., clicking a 'back' button in the header) instead of default anchor tags.
     */
    const openModal = (navFn: () => void) => {
        if (!hasUnsavedChanges) {
            navFn();
            return;
        }
        setPendingNav(() => navFn);
        setIsMenuOpen(true);
    };

    // 2. Intercept Internal Navigation (Links, Sidebar, etc.)
    useEffect(() => {
        const handleInternalNavigation = (e: MouseEvent) => {
            if (!hasUnsavedChanges) return;

            const target = e.target as HTMLElement;
            const anchor = target.closest("a");

            if (anchor && anchor.href) {
                const url = new URL(anchor.href);
                const currentUrl = new URL(window.location.href);

                // Check if it's an internal link and not a hash/same page
                if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
                    e.preventDefault();
                    setPendingNav(() => () => router.push(anchor.href));
                    setIsMenuOpen(true);
                }
            }
        };

        window.addEventListener("click", handleInternalNavigation, true);
        return () => window.removeEventListener("click", handleInternalNavigation, true);
    }, [hasUnsavedChanges, router]);

    const handleSaveAndLeave = async () => {
        if (onSave.current) {
            await onSave.current();
            setHasUnsavedChanges(false);
            setIsMenuOpen(false);
            if (pendingNav) pendingNav();
            setPendingNav(null);
        }
    };

    const handleDiscardAndLeave = () => {
        if (onDiscard.current) onDiscard.current();
        setHasUnsavedChanges(false);
        setIsMenuOpen(false);
        if (pendingNav) pendingNav();
        setPendingNav(null);
    };

    const handleCancel = () => {
        setIsMenuOpen(false);
        setPendingNav(null);
    };

    return (
        <UnsavedChangesContext.Provider value={{ 
            hasUnsavedChanges, 
            setHasUnsavedChanges, 
            onSave, 
            onDiscard,
            openModal
        }}>
            {children}
            {/* The single, centralized instance of the modal for the whole dashboard layout */}
            <UnsavedChangesModal
                open={isMenuOpen}
                onClose={handleCancel}
                onSaveAndLeave={handleSaveAndLeave}
                onDiscardAndLeave={handleDiscardAndLeave}
            />
        </UnsavedChangesContext.Provider>
    );
}

export function useUnsavedChanges() {
    return useContext(UnsavedChangesContext);
}
