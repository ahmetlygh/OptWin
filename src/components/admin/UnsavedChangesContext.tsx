"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

type UnsavedChangesContextType = {
    hasUnsavedChanges: boolean;
    setHasUnsavedChanges: (v: boolean) => void;
    onSave: React.MutableRefObject<(() => Promise<void>) | null>;
    onDiscard: React.MutableRefObject<(() => void) | null>;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextType>({
    hasUnsavedChanges: false,
    setHasUnsavedChanges: () => {},
    onSave: { current: null },
    onDiscard: { current: null },
});

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const onSave = useRef<(() => Promise<void>) | null>(null);
    const onDiscard = useRef<(() => void) | null>(null);

    // Global browser guard (F5, Tab close)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = ""; // Standard way to show browser prompt
                return "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);

    return (
        <UnsavedChangesContext.Provider value={{ hasUnsavedChanges, setHasUnsavedChanges, onSave, onDiscard }}>
            {children}
        </UnsavedChangesContext.Provider>
    );
}

export function useUnsavedChanges() {
    return useContext(UnsavedChangesContext);
}
