"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { Feature } from "@/types/feature";
import { TranslatableText } from "../shared/TranslatableText";
import { HighlightText } from "../shared/HighlightText";
import { FeatureIcon, CheckIcon, GlobeIcon } from "../shared/Icons";

interface FeatureCardProps {
    feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
    const isSelected = useOptWinStore(state => state.selectedFeatures.has(feature.slug));
    const toggleFeature = useOptWinStore(state => state.toggleFeature);
    const setDnsModalOpen = useOptWinStore(state => state.setDnsModalOpen);
    const dnsProvider = useOptWinStore(state => state.dnsProvider);
    const lang = useOptWinStore(state => state.lang);

    const isChangeDns = feature.slug === "changeDNS";

    const titleEn = feature.translations.find(t => t.lang === "en")?.title || feature.slug;
    const titleTr = feature.translations.find(t => t.lang === "tr")?.title || feature.slug;
    const descEn = feature.translations.find(t => t.lang === "en")?.desc || "";
    const descTr = feature.translations.find(t => t.lang === "tr")?.desc || "";

    let riskBadgeColor = "";
    let riskBadgeBg = "";
    let riskBadgeTextEn = "";
    let riskBadgeTextTr = "";

    switch (feature.risk) {
        case "high":
            riskBadgeColor = "text-[#ff6b6b]";
            riskBadgeBg = "bg-[#ff6b6b]/10 border-[#ff6b6b]/30";
            riskBadgeTextEn = "Critical";
            riskBadgeTextTr = "Riskli";
            break;
        case "medium":
            riskBadgeColor = "text-[#feca57]";
            riskBadgeBg = "bg-[#feca57]/10 border-[#feca57]/30";
            riskBadgeTextEn = "Read Desc";
            riskBadgeTextTr = "Dikkat";
            break;
        default:
            riskBadgeColor = "text-[#1dd1a1]";
            riskBadgeBg = "bg-[#1dd1a1]/10 border-[#1dd1a1]/30";
            riskBadgeTextEn = "Safe";
            riskBadgeTextTr = "Güvenli";
            break;
    }

    return (
        <label
            className={`group relative rounded-xl p-5 border cursor-pointer overflow-hidden transition-all duration-300 ease-out ${isSelected
                ? "bg-[var(--accent-color)]/10 border-[var(--accent-color)] shadow-[0_0_20px_rgba(107,91,230,0.15)] scale-[1.02]"
                : "bg-[var(--card-bg)] border-[var(--border-color)] hover:border-[var(--accent-color)]/50 hover:shadow-lg hover:shadow-[var(--accent-color)]/10 hover:scale-[1.01]"
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
                    {!feature.noRisk ? (
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="text-[var(--text-primary)] font-semibold tracking-tight">
                                <HighlightText text={lang === "tr" ? titleTr : titleEn} />
                            </h4>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${riskBadgeBg} ${riskBadgeColor}`}>
                                <TranslatableText en={riskBadgeTextEn} tr={riskBadgeTextTr} />
                            </span>
                        </div>
                    ) : (
                        <h4 className="text-[var(--text-primary)] font-semibold tracking-tight mb-1">
                            <HighlightText text={lang === "tr" ? titleTr : titleEn} />
                        </h4>
                    )}
                    <p className="text-sm text-[var(--text-secondary)] leading-snug">
                        <HighlightText text={lang === "tr" ? descTr : descEn} />
                    </p>

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
}
