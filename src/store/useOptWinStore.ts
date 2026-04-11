"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = string;
export type Theme = "dark" | "light";

interface OptWinState {
    // Language & Theme
    lang: Lang;
    theme: Theme;
    setLang: (lang: Lang) => void;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;

    // DB-driven translations
    dbTranslations: Record<string, string>;
    translationsLoaded: boolean;
    isTranslationsLoading: boolean;
    activeLangRequest: string;
    loadTranslations: (lang: string) => Promise<void>;

    // Feature selection
    selectedFeatures: Record<string, boolean>;
    toggleFeature: (slug: string) => void;
    selectFeatures: (slugs: string[]) => void;
    clearFeatures: () => void;

    // DNS
    dnsProvider: string;
    setDnsProvider: (provider: string) => void;

    // Search & Display
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    showDescriptions: boolean;
    toggleDescriptions: () => void;
    showPresetDescriptions: boolean;
    togglePresetDescriptions: () => void;
    collapsedCategories: Set<string>;
    toggleCategoryCollapse: (slug: string) => void;
    setCollapsedCategories: (slugs: string[]) => void;

    // Modals & Overlays
    isRestoreModalOpen: boolean;
    setRestoreModalOpen: (isOpen: boolean) => void;
    isWarningModalOpen: boolean;
    setWarningModalOpen: (isOpen: boolean) => void;
    isScriptOverlayOpen: boolean;
    setScriptOverlayOpen: (isOpen: boolean) => void;
    isDnsModalOpen: boolean;
    setDnsModalOpen: (isOpen: boolean) => void;
    isSupportModalOpen: boolean;
    setSupportModalOpen: (isOpen: boolean) => void;

    previewCode: string;
    setPreviewCode: (code: string) => void;

    // Toast
    toast: { show: boolean; message: string; type: "success" | "warning" | "error" } | null;
    showToast: (message: string, type?: "success" | "warning" | "error") => void;
    hideToast: () => void;

    // Transition State
    isChangingLocale: boolean;
    setIsChangingLocale: (val: boolean) => void;

    // Header Stickiness
    isTopPanelStuck: boolean;
    setIsTopPanelStuck: (val: boolean) => void;
}

export const useOptWinStore = create<OptWinState>()(
    persist(
        (set, get) => ({
            // Defaults
            lang: "en",
            theme: "dark",
            selectedFeatures: {},
            dnsProvider: "cloudflare",
            searchQuery: "",
            showDescriptions: true,
            showPresetDescriptions: true,
            collapsedCategories: new Set<string>(),
            dbTranslations: {},
            translationsLoaded: false,
            isTranslationsLoading: false,

            // Load translations from DB API
            activeLangRequest: "",
            loadTranslations: async (lang: string) => {
                if (get().activeLangRequest === lang && get().translationsLoaded) return;
                set({ activeLangRequest: lang, isTranslationsLoading: true });
                try {
                    const res = await fetch(`/api/ui-translations?lang=${lang}`);
                    if (res.ok) {
                        const data = await res.json();
                        set({ dbTranslations: data, translationsLoaded: true, activeLangRequest: lang });
                    }
                } catch {
                    // fallbacks...
                } finally {
                    set({ isTranslationsLoading: false });
                }
            },

            // Language
            setLang: (lang) => {
                if (typeof window !== "undefined") {
                    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`;
                }
                set({ lang });
            },

            // Theme
            setTheme: (theme) => {
                if (typeof window !== "undefined") {
                    document.cookie = `NEXT_THEME=${theme}; path=/; max-age=31536000`;
                }
                set({ theme });
            },
            toggleTheme: () => {
                const newTheme = get().theme === "dark" ? "light" : "dark";
                if (typeof window !== "undefined") {
                    document.cookie = `NEXT_THEME=${newTheme}; path=/; max-age=31536000`;
                }
                set({ theme: newTheme });
            },

            // Features
            toggleFeature: (slug) =>
                set((state) => {
                    const next = { ...state.selectedFeatures };

                    // Mutual exclusion: highPerformance ↔ ultimatePerformance
                    if (slug === "highPerformance" && !next[slug]) {
                        delete next["ultimatePerformance"];
                    }
                    if (slug === "ultimatePerformance" && !next[slug]) {
                        delete next["highPerformance"];
                    }

                    if (next[slug]) {
                        delete next[slug];
                    } else {
                        next[slug] = true;
                        if (slug === "changeDNS") {
                            setTimeout(() => get().setDnsModalOpen(true), 10);
                        }
                    }

                    return { selectedFeatures: next };
                }),

            selectFeatures: (slugs) =>
                set(() => {
                    const obj: Record<string, boolean> = {};
                    slugs.forEach(s => obj[s] = true);
                    return { selectedFeatures: obj };
                }),

            clearFeatures: () =>
                set(() => ({
                    selectedFeatures: {},
                })),

            // DNS
            setDnsProvider: (provider) => set({ dnsProvider: provider }),

            // Search & Display
            setSearchQuery: (query) => set({ searchQuery: query }),
            toggleDescriptions: () => set((state) => ({ showDescriptions: !state.showDescriptions })),
            togglePresetDescriptions: () => set((state) => ({ showPresetDescriptions: !state.showPresetDescriptions })),
            toggleCategoryCollapse: (slug) => set((state) => {
                const next = new Set(state.collapsedCategories);
                if (next.has(slug)) next.delete(slug);
                else next.add(slug);
                return { collapsedCategories: next };
            }),
            setCollapsedCategories: (slugs) => set({ collapsedCategories: new Set(slugs) }),

            // Modals
            isRestoreModalOpen: false,
            setRestoreModalOpen: (isOpen) => set({ isRestoreModalOpen: isOpen }),

            isWarningModalOpen: false,
            setWarningModalOpen: (isOpen) => set({ isWarningModalOpen: isOpen }),

            isScriptOverlayOpen: false,
            setScriptOverlayOpen: (isOpen) => set({ isScriptOverlayOpen: isOpen }),

            isDnsModalOpen: false,
            setDnsModalOpen: (isOpen) => set({ isDnsModalOpen: isOpen }),

            isSupportModalOpen: false,
            setSupportModalOpen: (isOpen) => set({ isSupportModalOpen: isOpen }),

            previewCode: "",
            setPreviewCode: (code) => set({ previewCode: code }),

            // Toast
            toast: null,
            showToast: (message, type = "success") => {
                set({ toast: { show: true, message, type } });
                setTimeout(() => set({ toast: null }), 3000);
            },
            hideToast: () => set({ toast: null }),

            // Transition
            isChangingLocale: false,
            setIsChangingLocale: (val) => set({ isChangingLocale: val }),

            // Header Stickiness
            isTopPanelStuck: false,
            setIsTopPanelStuck: (val) => set({ isTopPanelStuck: val }),
        }),
        {
            name: "optwin-store",
            // Only persist user preferences, NOT ephemeral UI state
            partialize: (state) => ({
                lang: state.lang,
                theme: state.theme,
                selectedFeatures: state.selectedFeatures,
                dnsProvider: state.dnsProvider,
            } as unknown as OptWinState),
            storage: {
                getItem: (name) => {
                    if (typeof window === "undefined") return null;
                    const str = localStorage.getItem(name);
                    if (!str) return null;
                    // For backwards compatibility: Convert old Array-based selectedFeatures to Object
                    const parsed = JSON.parse(str);
                    if (parsed?.state?.selectedFeatures && Array.isArray(parsed.state.selectedFeatures)) {
                        const obj: Record<string, boolean> = {};
                        parsed.state.selectedFeatures.forEach((k: string) => (obj[k] = true));
                        parsed.state.selectedFeatures = obj;
                    }
                    return parsed;
                },
                setItem: (name, value) => {
                    if (typeof window === "undefined") return;
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name) => {
                    if (typeof window === "undefined") return;
                    localStorage.removeItem(name);
                },
            },
        }
    )
);
