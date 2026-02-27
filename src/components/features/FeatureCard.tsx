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
    const { selectedFeatures, toggleFeature, lang } = useOptWinStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isSelected = selectedFeatures.has(feature.slug);
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
        <div
            onClick={() => mounted && toggleFeature(feature.slug)}
            className={`
        relative flex gap-3.5 p-5 rounded-2xl border cursor-pointer transition-all duration-300 shadow-sm
        ${isSelected
                    ? "border-[var(--accent-color)] bg-[var(--accent-color)]/5 shadow-[0_0_15px_rgba(108,92,231,0.2)]"
                    : "border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--accent-color)]"
                }
      `}
        >
            <div className="text-2xl text-[var(--accent-color)] shrink-0 pt-0.5">
                <i className={`${feature.iconType === "brands" ? "fa-brands" : "fa-solid"} ${feature.icon}`}></i>
            </div>

            <div className="flex-1">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1.5 pr-8 tracking-tight">
                    <HighlightText text={lang === "tr" ? titleTr : titleEn} />
                </h3>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                    <HighlightText text={lang === "tr" ? descTr : descEn} />
                </p>

                {!feature.noRisk && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${riskBadgeBg} ${riskBadgeColor}`}>
                        <TranslatableText en={riskBadgeTextEn} tr={riskBadgeTextTr} />
                    </span>
                )}
            </div>

            {/* Checkbox indicator top right */}
            <div className={`
        absolute top-4 right-4 w-5 h-5 border rounded-md flex items-center justify-center transition-all duration-300
        ${isSelected ? "bg-[var(--accent-color)] border-[var(--accent-color)]" : "border-[var(--border-color)]"}
      `}>
                {isSelected && <span className="text-white text-xs leading-none font-bold block mt-[1px]">✓</span>}
            </div>
        </div>
    );
}
