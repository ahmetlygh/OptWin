"use client";

import { useState, useEffect, memo } from "react";
import { useOptWinStore } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { Feature } from "@/types/feature";
import { HighlightText } from "../shared/HighlightText";
import { FeatureIcon, CheckIcon, GlobeIcon, InfoIcon } from "../shared/Icons";
import { motion, AnimatePresence } from "framer-motion";

interface FeatureCardProps {
    feature: Feature;
}

export const FeatureCard = memo(function FeatureCard({ feature }: FeatureCardProps) {
    const isSelected = useOptWinStore(state => !!state.selectedFeatures[feature.slug]);
    const toggleFeature = useOptWinStore(state => state.toggleFeature);
    const setDnsModalOpen = useOptWinStore(state => state.setDnsModalOpen);
    const dnsProvider = useOptWinStore(state => state.dnsProvider);
    const lang = useOptWinStore(state => state.lang);
    const { t } = useTranslation();
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
    const isNewBadgeVisible = feature.newBadge && (
        !feature.newBadgeExpiry || new Date(feature.newBadgeExpiry) > new Date()
    );

    return (
        <div
            role="checkbox"
            aria-checked={isSelected}
            tabIndex={0}
            onClick={() => toggleFeature(feature.slug)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleFeature(feature.slug);
                }
            }}
            className={`group relative rounded-xl ${isDescVisible ? 'p-5' : 'p-3.5'} border border-(--border-color) cursor-pointer overflow-hidden transition-all duration-300 ease-out outline-none focus-visible:ring-2 focus-visible:ring-(--accent-color)/50 focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-color) ${isSelected
                ? "bg-purple-500/10 border-purple-500/40 shadow-sm shadow-purple-500/5 hover:-translate-y-1"
                : "bg-(--card-bg) shadow-sm shadow-black/5 dark:shadow-none hover:border-(--border-color)/80 hover:shadow-md hover:shadow-black/10 dark:hover:shadow-none hover:-translate-y-1"
                }`}
        >
            {/* Selection glow */}
            {isSelected && (
                <div className="absolute inset-0 bg-linear-to-r from-(--accent-color)/5 to-transparent pointer-events-none animate-subtle-reveal"></div>
            )}

            {/* Checkbox indicator with framer-motion Pop Effect */}
            <div className="absolute top-4 right-4 z-10 pointer-events-none">
                <div
                    className={`relative flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isSelected ? 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'border-(--border-color) bg-(--card-bg) group-hover:border-purple-500/50'}`}
                >
                    <AnimatePresence>
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0.3, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.3, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 450, damping: 15 }}
                                className="absolute inset-0 bg-purple-500 rounded-full flex items-center justify-center"
                            >
                                <CheckIcon
                                    className="text-white"
                                    size={14}
                                    strokeWidth={3.5}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content */}
            <div className="flex items-start gap-4 pointer-events-none">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-(--border-color) text-(--text-secondary) group-hover:bg-(--border-color)/80 group-hover:text-(--text-primary)'}`}>
                    <FeatureIcon icon={feature.icon} size={20} />
                </div>
                <div className="flex-1 pr-6">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1 pointer-events-auto">
                        <h4 className="text-(--text-primary) font-semibold tracking-tight pointer-events-none">
                            <HighlightText text={title} />
                        </h4>
                        {isNewBadgeVisible && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-(--accent-color)/15 border-(--accent-color)/30 text-(--accent-color) pointer-events-none animate-pulse leading-none">
                                {t["feature.badge.new"]}
                            </span>
                        )}
                        {!feature.noRisk && feature.risk === "medium" && (
                            <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border bg-amber-500/15 border-amber-500/30 text-amber-400 pointer-events-none leading-none shadow-[0_0_6px_rgba(245,158,11,0.15)]">
                                {t["feature.risk.medium"]}
                            </span>
                        )}
                        {!feature.noRisk && feature.risk === "high" && (
                            <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border bg-red-500/15 border-red-500/30 text-red-500 pointer-events-none leading-none shadow-[0_0_6px_rgba(239,68,68,0.15)]">
                                {t["feature.risk.high"]}
                            </span>
                        )}
                        {!showDescriptions && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setLocalShowDesc(prev => !prev);
                                }}
                                className={`flex items-center justify-center rounded-full p-1 transition-colors duration-200 opacity-0 group-hover:opacity-100 ${localShowDesc ? 'text-(--accent-color) bg-(--accent-color)/10' : 'text-(--text-secondary) hover:bg-(--border-color) hover:text-(--text-primary)'}`}
                                title={localShowDesc ? "Hide description" : "Show description"}
                            >
                                <InfoIcon size={14} />
                            </button>
                        )}
                    </div>

                    {/* Description — GPU-accelerated show/hide with grid trick */}
                    <div
                        className="transition-[grid-template-rows,opacity] duration-300 ease-in-out grid pointer-events-none"
                        style={{
                            gridTemplateRows: isDescVisible ? '1fr' : '0fr',
                            opacity: isDescVisible ? 1 : 0,
                        }}
                    >
                        <div className="overflow-hidden">
                            <p className="text-sm text-(--text-secondary) leading-relaxed pt-0.5">
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
                            className="pointer-events-auto mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--accent-color)/15 border border-(--accent-color)/30 text-(--accent-color) text-xs font-bold hover:bg-(--accent-color)/25 transition-all duration-200 animate-slide-in-right"
                        >
                            <GlobeIcon size={14} />
                            <span>{lang === "tr" ? "Değiştir" : "Change"}: {dnsProvider}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});
