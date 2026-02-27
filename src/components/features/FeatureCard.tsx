"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { Feature } from "@/types/feature";
import { TranslatableText } from "../shared/TranslatableText";
import { HighlightText } from "../shared/HighlightText";
import { useEffect, useState } from "react";

interface FeatureCardProps {
    feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
    const isSelected = useOptWinStore(state => state.selectedFeatures.has(feature.slug));
    const toggleFeature = useOptWinStore(state => state.toggleFeature);
    const lang = useOptWinStore(state => state.lang);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);
    const titleEn = feature.translations.find(t => t.lang === "en")?.title || feature.slug;
    const titleTr = feature.translations.find(t => t.lang === "tr")?.title || feature.slug;
    const descEn = feature.translations.find(t => t.lang === "en")?.desc || "";
    const descTr = feature.translations.find(t => t.lang === "tr")?.desc || "";

    // Risk badges logic based on old config
    let riskBadgeColor = "";
    let riskBadgeBg = "";
    let riskBadgeTextEn = "";
    let riskBadgeTextTr = "";

    switch (feature.risk) {
        case "high":
            riskBadgeColor = "text-[#ff6b6b]";
            riskBadgeBg = "bg-[#ff6b6b]/10 border-[#ff6b6b]/30";
            riskBadgeTextEn = "Critical"; // Or Advanced
            riskBadgeTextTr = "Riskli";
            break;
        case "medium":
            riskBadgeColor = "text-[#feca57]";
            riskBadgeBg = "bg-[#feca57]/10 border-[#feca57]/30";
            riskBadgeTextEn = "Read Desc";
            riskBadgeTextTr = "Dikkat";
            break;
        default:
            // low = safe
            riskBadgeColor = "text-[#1dd1a1]";
            riskBadgeBg = "bg-[#1dd1a1]/10 border-[#1dd1a1]/30";
            riskBadgeTextEn = "Safe";
            riskBadgeTextTr = "Güvenli";
            break;
    }

    return (
        <label
            className={`group relative rounded-xl p-5 border transition-all cursor-pointer overflow-hidden ${isSelected
                ? "bg-[var(--accent-color)]/10 border-[var(--accent-color)] shadow-[0_0_20px_rgba(107,91,230,0.15)] scale-[1.01]"
                : "bg-[var(--card-bg)] border-[var(--border-color)] hover:border-[var(--accent-color)]/50 hover:shadow-lg hover:shadow-[var(--accent-color)]/10"
                }`}
        >
            {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-color)]/5 to-transparent pointer-events-none animate-in fade-in duration-300"></div>
            )}
            <div className="absolute top-4 right-4 z-10 pointer-events-none">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={isSelected}
                    onChange={() => mounted && toggleFeature(feature.slug)}
                />

                {/* Custom glowing circular indicator */}
                <div className={`relative flex items-center justify-center w-[22px] h-[22px] rounded-full border-[2px] transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isSelected ? 'border-[var(--accent-color)] bg-[var(--accent-color)] shadow-[0_0_12px_rgba(107,91,230,0.5)] scale-110' : 'border-[var(--border-color)] bg-black/20 scale-100 group-hover:border-[var(--accent-color)]/50'}`}>

                    {/* Animated checkmark inside */}
                    <span className={`material-symbols-outlined text-white text-[16px] font-black transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isSelected ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`}>
                        check
                    </span>

                    {/* Ripple effect on check */}
                    {isSelected && (
                        <div className="absolute inset-0 rounded-full border-2 border-[var(--accent-color)] animate-ping opacity-0" style={{ animationDuration: '1s' }}></div>
                    )}
                </div>
            </div>
            <div className="flex items-start gap-4 pointer-events-none">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-color)]/10 flex items-center justify-center flex-shrink-0 text-[var(--accent-color)]">
                    <i className={`${feature.iconType === "brands" ? "fa-brands" : "fa-solid"} ${feature.icon} text-lg`}></i>
                </div>
                <div className="flex-1 pr-6">
                    {!feature.noRisk ? (
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="text-white font-semibold tracking-tight">
                                <HighlightText text={lang === "tr" ? titleTr : titleEn} />
                            </h4>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${riskBadgeBg} ${riskBadgeColor}`}>
                                <TranslatableText en={riskBadgeTextEn} tr={riskBadgeTextTr} />
                            </span>
                        </div>
                    ) : (
                        <h4 className="text-white font-semibold tracking-tight mb-1">
                            <HighlightText text={lang === "tr" ? titleTr : titleEn} />
                        </h4>
                    )}
                    <p className="text-sm text-[var(--text-secondary)] leading-snug">
                        <HighlightText text={lang === "tr" ? descTr : descEn} />
                    </p>
                </div>
            </div>
        </label>
    );
}
