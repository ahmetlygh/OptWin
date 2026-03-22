"use client";

import { useState, useEffect, memo } from "react";
import { useOptWinStore } from "@/store/useOptWinStore";
import { Feature } from "@/types/feature";
import { HighlightText } from "../shared/HighlightText";
import { FeatureIcon, CheckIcon, GlobeIcon, InfoIcon } from "../shared/Icons";

interface FeatureCardProps {
    feature: Feature;
}

export const FeatureCard = memo(function FeatureCard({ feature }: FeatureCardProps) {
    const isSelected = useOptWinStore(state => state.selectedFeatures.has(feature.slug));
    const toggleFeature = useOptWinStore(state => state.toggleFeature);
    const setDnsModalOpen = useOptWinStore(state => state.setDnsModalOpen);
    const dnsProvider = useOptWinStore(state => state.dnsProvider);
    const lang = useOptWinStore(state => state.lang);
    const showDescriptions = useOptWinStore(state => state.showDescriptions);
    const [localShowDesc, setLocalShowDesc] = useState(false);

    // Reset local toggle when global showDescriptions changes
    useEffect(() => {
        setLocalShowDesc(false);
    }, [showDescriptions]);

    const isChangeDns = feature.slug === "changeDNS";
    const isDescVisible = showDescriptions || localShowDesc;

    // Multi-language: try selected lang first, then fallback to en, then slug
    const getTranslation = (field: "title" | "desc") => {
        const langTr = feature.translations.find(t => t.lang === lang);
        if (langTr && langTr[field]) return langTr[field];
        const enTr = feature.translations.find(t => t.lang === "en");
        if (enTr && enTr[field]) return enTr[field];
        return field === "title" ? feature.slug : "";
    };

    const title = getTranslation("title");
    const desc = getTranslation("desc");

    // New badge logic
    const newBadgeLabels: Record<string, string> = {
        en: "New", tr: "Yeni", de: "Neu", fr: "Nouveau", zh: "新", es: "Nuevo", hi: "नया",
    };
    const isNewBadgeVisible = feature.newBadge && (
        !feature.newBadgeExpiry || new Date(feature.newBadgeExpiry) > new Date()
    );

    return (
        <label
            className={`group relative rounded-xl ${isDescVisible ? 'p-5' : 'p-3.5'} border cursor-pointer overflow-hidden transition-all duration-300 ease-out ${isSelected
                ? "bg-[var(--accent-color)]/10 border-[var(--accent-color)] shadow-[0_0_20px_rgba(107,91,230,0.15)] scale-100 md:scale-[1.02]"
                : "bg-[var(--card-bg)] border-[var(--border-color)] hover:border-[var(--accent-color)]/50 hover:shadow-lg hover:shadow-[var(--accent-color)]/10 md:hover:scale-[1.01]"
                }`}
        >
            {/* Selection glow */}
            {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-color)]/5 to-transparent pointer-events-none animate-subtle-reveal"></div>
            )}

            {/* Checkbox indicator */}
            <div className="absolute top-4 right-4 z-10 pointer-events-none">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={isSelected}
                    onChange={() => toggleFeature(feature.slug)}
                />
                <div
                    className={`relative flex items-center justify-center w-[22px] h-[22px] rounded-full border-[2px] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isSelected ? 'border-[var(--accent-color)] bg-[var(--accent-color)] shadow-[0_0_12px_rgba(107,91,230,0.5)] scale-110' : 'border-[var(--border-color)] bg-black/20 scale-100 group-hover:border-[var(--accent-color)]/50'}`}
                >
                    {isSelected && (
                        <CheckIcon
                            className="text-white animate-check-bounce"
                            size={14}
                            strokeWidth={3}
                        />
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex items-start gap-4 pointer-events-none">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isSelected ? 'bg-[var(--accent-color)]/20 text-[var(--accent-color)] shadow-[0_0_10px_rgba(107,91,230,0.2)]' : 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] group-hover:bg-[var(--accent-color)]/15'}`}>
                    <FeatureIcon icon={feature.icon} size={18} />
                </div>
                <div className="flex-1 pr-6">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1 pointer-events-auto">
                        <h4 className="text-[var(--text-primary)] font-semibold tracking-tight pointer-events-none">
                            <HighlightText text={title} />
                        </h4>
                        {isNewBadgeVisible && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-[var(--accent-color)]/15 border-[var(--accent-color)]/30 text-[var(--accent-color)] pointer-events-none animate-pulse leading-none">
                                {newBadgeLabels[lang] || newBadgeLabels.en}
                            </span>
                        )}
                        {!feature.noRisk && feature.risk === "medium" && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-amber-500/10 border-amber-500/25 text-amber-400 pointer-events-none leading-none">
                                {lang === "tr" ? "Orta Risk" : "Medium"}
                            </span>
                        )}
                        {!feature.noRisk && feature.risk === "high" && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-red-500/10 border-red-500/25 text-red-400 pointer-events-none leading-none">
                                {lang === "tr" ? "Yüksek Risk" : "High Risk"}
                            </span>
                        )}
                        {!showDescriptions && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setLocalShowDesc(prev => !prev);
                                }}
                                className={`flex items-center justify-center rounded-full p-1 transition-colors duration-200 opacity-0 group-hover:opacity-100 ${localShowDesc ? 'text-[var(--accent-color)] bg-[var(--accent-color)]/10' : 'text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'}`}
                                title={localShowDesc ? "Hide description" : "Show description"}
                            >
                                <InfoIcon size={14} />
                            </button>
                        )}
                    </div>

                    {/* Description — GPU-accelerated show/hide with grid trick */}
                    <div
                        className="transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] grid pointer-events-none"
                        style={{
                            gridTemplateRows: isDescVisible ? '1fr' : '0fr',
                            opacity: isDescVisible ? 1 : 0,
                        }}
                    >
                        <div className="overflow-hidden">
                            <p className="text-sm text-[var(--text-secondary)] leading-snug pt-0.5">
                                <HighlightText text={desc} />
                            </p>
                        </div>
                    </div>

                    {/* DNS Change button */}
                    {isChangeDns && isSelected && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDnsModalOpen(true);
                            }}
                            className="pointer-events-auto mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--accent-color)]/15 border border-[var(--accent-color)]/30 text-[var(--accent-color)] text-xs font-bold hover:bg-[var(--accent-color)]/25 transition-all duration-200 animate-slide-in-right"
                        >
                            <GlobeIcon size={14} />
                            <span>{lang === "tr" ? "Değiştir" : "Change"}: {dnsProvider}</span>
                        </button>
                    )}
                </div>
            </div>
        </label>
    );
});
