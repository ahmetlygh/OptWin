"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "en" | "tr" | "zh" | "es" | "hi";
export type Theme = "dark" | "light";

interface OptWinState {
    // Language & Theme
    lang: Lang;
    theme: Theme;
    setLang: (lang: Lang) => void;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;

    // Feature selection
    selectedFeatures: Set<string>;
    toggleFeature: (slug: string) => void;
    selectFeatures: (slugs: string[]) => void;
    clearFeatures: () => void;

    // DNS
    dnsProvider: string;
    setDnsProvider: (provider: string) => void;

    // Search
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    // Modals & Overlays
    isRestoreModalOpen: boolean;
    setRestoreModalOpen: (isOpen: boolean) => void;
    isWarningModalOpen: boolean;
    setWarningModalOpen: (isOpen: boolean) => void;
    isScriptOverlayOpen: boolean;
    setScriptOverlayOpen: (isOpen: boolean) => void;
    isDnsModalOpen: boolean;
    setDnsModalOpen: (isOpen: boolean) => void;

    previewCode: string;
    setPreviewCode: (code: string) => void;

    // Toast
    toast: { show: boolean; message: string; type: "success" | "warning" | "error" } | null;
    showToast: (message: string, type?: "success" | "warning" | "error") => void;
    hideToast: () => void;
}

export const useOptWinStore = create<OptWinState>()(
    persist(
        (set, get) => ({
            // Defaults
            lang: "en",
            theme: "dark",
            selectedFeatures: new Set<string>(),
            dnsProvider: "cloudflare",
            searchQuery: "",

            // Language
            setLang: (lang) => set({ lang }),

            // Theme
            setTheme: (theme) => set({ theme }),
            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === "dark" ? "light" : "dark",
                })),

            // Features
            toggleFeature: (slug) =>
                set((state) => {
                    const next = new Set(state.selectedFeatures);

                    // Mutual exclusion: highPerformance ↔ ultimatePerformance
                    if (slug === "highPerformance" && !next.has(slug)) {
                        next.delete("ultimatePerformance");
                    }
                    if (slug === "ultimatePerformance" && !next.has(slug)) {
                        next.delete("highPerformance");
                    }

                    if (next.has(slug)) {
                        next.delete(slug);
                    } else {
                        next.add(slug);
                        if (slug === "changeDNS") {
                            setTimeout(() => get().setDnsModalOpen(true), 10);
                        }
                    }

                    return { selectedFeatures: next };
                }),

            selectFeatures: (slugs) =>
                set(() => ({
                    selectedFeatures: new Set(slugs),
                })),

            clearFeatures: () =>
                set(() => ({
                    selectedFeatures: new Set<string>(),
                })),

            // DNS
            setDnsProvider: (provider) => set({ dnsProvider: provider }),

            // Search
            setSearchQuery: (query) => set({ searchQuery: query }),

            // Modals
            isRestoreModalOpen: false,
            setRestoreModalOpen: (isOpen) => set({ isRestoreModalOpen: isOpen }),

            isWarningModalOpen: false,
            setWarningModalOpen: (isOpen) => set({ isWarningModalOpen: isOpen }),

            isScriptOverlayOpen: false,
            setScriptOverlayOpen: (isOpen) => set({ isScriptOverlayOpen: isOpen }),

            isDnsModalOpen: false,
            setDnsModalOpen: (isOpen) => set({ isDnsModalOpen: isOpen }),

            previewCode: "",
            setPreviewCode: (code) => set({ previewCode: code }),

            // Toast
            toast: null,
            showToast: (message, type = "success") => {
                set({ toast: { show: true, message, type } });
                setTimeout(() => set({ toast: null }), 3000);
            },
            hideToast: () => set({ toast: null }),
        }),
        {
            name: "optwin-store",
            // Serialize Set<string> ↔ Array<string> for localStorage
            storage: {
                getItem: (name) => {
                    const str = localStorage.getItem(name);
                    if (!str) return null;
                    const parsed = JSON.parse(str);
                    if (parsed?.state?.selectedFeatures) {
                        parsed.state.selectedFeatures = new Set(
                            parsed.state.selectedFeatures
                        );
                    }
                    return parsed;
                },
                setItem: (name, value) => {
                    const toStore = {
                        ...value,
                        state: {
                            ...value.state,
                            selectedFeatures: Array.from(
                                value.state.selectedFeatures as Set<string>
                            ),
                        },
                    };
                    localStorage.setItem(name, JSON.stringify(toStore));
                },
                removeItem: (name) => localStorage.removeItem(name),
            },
        }
    )
);
