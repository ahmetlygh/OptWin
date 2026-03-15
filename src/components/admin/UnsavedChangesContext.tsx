"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

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

    return (
        <UnsavedChangesContext.Provider value={{ hasUnsavedChanges, setHasUnsavedChanges, onSave, onDiscard }}>
            {children}
        </UnsavedChangesContext.Provider>
    );
}

export function useUnsavedChanges() {
    return useContext(UnsavedChangesContext);
}
