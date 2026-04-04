"use client";

import { useState, useEffect, useRef } from "react";
import { SearchBar } from "../features/SearchBar";
import { ChevronDownIcon } from "../shared/Icons";
import { DnsProvider } from "@/types/feature";
import { PresetControls } from "./PresetControls";
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
    dnsProviders,
}: {
    presets: PresetDef[];
    allFeatureSlugs: string[];
    dnsProviders: DnsProvider[];
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isStuck, setIsStuck] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const prevIsStuckRef = useRef(false);
    const { t } = useTranslation();

    // Detect when the panel becomes sticky via a sentinel element
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsStuck(!entry.isIntersecting),
            { threshold: 0, rootMargin: "-65px 0px 0px 0px" }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, []);

    // Auto-open presets on mobile when user scrolls back to top (isStuck goes from true → false)
    useEffect(() => {
        if (prevIsStuckRef.current && !isStuck) {
            setIsExpanded(true);
        }
        prevIsStuckRef.current = isStuck;
    }, [isStuck]);

    return (
        <>
            {/* Sentinel: when this scrolls out of view, the panel is stuck */}
            <div ref={sentinelRef} className="h-0 w-full md:hidden" />
            <section
                className={`flex flex-col sticky top-16 z-40 bg-(--bg-color)/95 backdrop-blur-sm -mx-6 px-6 border-b border-(--border-color) md:static md:bg-transparent md:border-none md:p-0 md:backdrop-blur-none animate-fade-in-up ${
                    isExpanded ? "py-4" : "py-2 md:py-0"
                }`}
            >
                {/* Collapse toggle — only visible on mobile AND when sticky */}
                <div className={`md:hidden mb-2 flex justify-end transition-all duration-300 ease-in-out ${isStuck ? "opacity-100 h-8" : "opacity-0 h-0 overflow-hidden pointer-events-none"}`}>
                    <button
                        type="button"
                        onClick={() => setIsExpanded((prev) => !prev)}
                        className={`flex items-center gap-2 rounded-lg border border-(--border-color) bg-(--card-bg) text-(--text-secondary) hover:text-(--accent-color) hover:border-(--accent-color)/40 transition-all duration-200 ${
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
                    <div className="overflow-hidden">
                        <div
                            className={`flex flex-col gap-6 transition-transform duration-300 md:translate-y-0 ${
                                isExpanded ? "translate-y-0" : "-translate-y-3"
                            }`}
                        >
                            <PresetControls
                                presets={presets}
                                allFeatureSlugs={allFeatureSlugs}
                                dnsProviders={dnsProviders}
                            />
                            <SearchBar />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
