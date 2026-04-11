"use client";

import { useState, useEffect, useRef } from "react";
import { SearchBar } from "../features/SearchBar";
import { ChevronDownIcon } from "../shared/Icons";
import { DnsProvider } from "@/types/feature";
import { GlobalActionButtons, PresetButtonsList } from "./PresetControls";
import { useOptWinStore } from "@/store/useOptWinStore";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";

type PresetDef = {
    id: string;
    slug: string;
    featureSlugs: string[];
    translations: { lang: string; name: string }[];
};

export function StickyControlsPanel({
    presets,
    allFeatureSlugs,
    allCategorySlugs,
    dnsProviders,
}: {
    presets: PresetDef[];
    allFeatureSlugs: string[];
    allCategorySlugs: string[];
    dnsProviders: DnsProvider[];
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isStuck, setIsStuck] = useState(false);
    const { setIsTopPanelStuck } = useOptWinStore();
    const sentinelRef = useRef<HTMLDivElement>(null);
    const prevIsStuckRef = useRef(false);
    const { t } = useTranslation();

    // Detect when the panel becomes sticky via a sentinel element
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                const stuck = !entry.isIntersecting;
                setIsStuck(stuck);
                setIsTopPanelStuck(stuck);
            },
            { threshold: 0, rootMargin: "-64px 0px 0px 0px" }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [setIsTopPanelStuck]);

    // Auto-open presets on mobile when user scrolls back to top (isStuck goes from true → false)
    useEffect(() => {
        if (prevIsStuckRef.current && !isStuck) {
            setIsExpanded(true);
        }
        prevIsStuckRef.current = isStuck;
    }, [isStuck]);

    return (
        <>
            {/* Sentinel: tracks height of presets so it triggers when the bottom edge goes out of view */}
            <div ref={sentinelRef} className="absolute w-full h-[240px] pointer-events-none opacity-0" aria-hidden="true" />
            <section
                className={`flex flex-col sticky top-16 z-40 bg-(--bg-color)/95 backdrop-blur-sm -mx-6 px-6 border-b border-(--border-color) md:static md:bg-transparent md:border-none md:p-0 md:backdrop-blur-none animate-fade-in-up will-change-[height] ${
                    isExpanded ? "py-4" : "py-2 md:py-0"
                }`}
            >
                {/* Collapse toggle — only visible on mobile AND when sticky */}
                <div className={`md:hidden mb-2 flex justify-end transition-all duration-300 ease-in-out ${isStuck ? "opacity-100 h-8" : "opacity-0 h-0 overflow-hidden pointer-events-none"}`}>
                    <button
                        type="button"
                        onClick={() => setIsExpanded((prev) => !prev)}
                        className={`cursor-pointer flex items-center gap-2 rounded-lg border border-(--border-color) bg-(--card-bg) text-(--text-secondary) hover:text-(--accent-color) hover:border-(--accent-color)/40 transition-all duration-200 ${
                            isExpanded ? "size-8 justify-center" : "h-8 px-3"
                        }`}
                        title={isExpanded ? t["preset.hidePresets"] : t["preset.showPresets"]}
                        aria-label={isExpanded ? t["preset.hidePresets"] : t["preset.showPresets"]}
                    >
                        {!isExpanded && (
                            <span className="text-xs font-semibold whitespace-nowrap">{t["preset.showPresets"]}</span>
                        )}
                        <ChevronDownIcon
                            size={16}
                            className={`shrink-0 transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                        />
                    </button>
                </div>

                <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out md:grid-rows-[1fr] md:opacity-100 ${
                        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                    <div className="overflow-hidden md:overflow-visible px-2 py-1 -mx-2">
                        <div
                            className={`flex flex-col gap-3 max-w-xl lg:max-w-2xl mx-auto w-full transition-transform duration-300 md:translate-y-0 ${
                                isExpanded ? "translate-y-0" : "-translate-y-3"
                            }`}
                        >
                            <div
                                className={`flex flex-col transition-all duration-300 ease-in-out md:max-h-none md:mb-3 ${
                                    isStuck 
                                        ? "max-h-0 opacity-0 mb-0 pointer-events-none overflow-hidden md:opacity-100 md:pointer-events-auto md:overflow-visible" 
                                        : "max-h-[800px] opacity-100 mb-3 pointer-events-auto overflow-visible"
                                }`}
                            >
                                <div className="flex flex-col gap-3 bg-(--card-bg)/50 backdrop-blur-md border border-(--border-color) p-4 rounded-2xl w-full">
                                    <div className="w-full flex flex-col items-center pb-1.5 pt-0.5">
                                        <h3 className="text-[11px] font-black text-(--text-primary)/70 uppercase tracking-[0.14em] px-1 flex items-center justify-center gap-1.5 drop-shadow-sm">
                                            {t["preset.mainTitle"] || "Ön Ayarlar"}
                                        </h3>
                                        <p className="text-[10.5px] text-(--text-secondary)/60 mt-1.5 px-1 leading-relaxed max-w-xl text-center">
                                            {t["preset.mainDescription"] || "Sistem performansınızı en üst düzeye çıkarmak için profesyonelce hazırlanmış tek tıkla uygulanabilen hazır yapılandırmalar."}
                                        </p>
                                    </div>
                                    <PresetButtonsList presets={presets} allFeatureSlugs={allFeatureSlugs} layout="topbar" />
                                    <div className="w-full h-px bg-(--border-color)/50 my-1"></div>
                                    <h4 className="text-[9px] font-bold text-(--text-secondary)/40 uppercase tracking-widest text-center mt-0.5 -mb-1.5">
                                        {t["preset.bulkActionsTitle"] || "Toplu İşlemler"}
                                    </h4>
                                    <GlobalActionButtons allCategorySlugs={allCategorySlugs} allFeatureSlugs={allFeatureSlugs} dnsProviders={dnsProviders} layout="topbar" />
                                </div>
                            </div>
                            
                            {/* Search component centered */}
                            <div className="flex justify-center flex-1 w-full relative z-20">
                                <SearchBar />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
