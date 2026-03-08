"use client";

import { CountUp } from "../shared/CountUp";
import { useTranslation } from "@/i18n/useTranslation";

interface HeroStatsProps {
    totalVisits: number;
    totalScripts: number;
    totalDownloads: number;
    featuresCount: number;
}

export function HeroStats({ totalVisits, totalScripts, totalDownloads, featuresCount }: HeroStatsProps) {
    const { t } = useTranslation();

    const formatStat = (n: number) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + "M+";
        if (n >= 1000) return (n / 1000).toFixed(1) + "K+";
        return n.toString();
    };

    // Fixed order: Visit → Optimization → Created → Downloaded
    // Values and order NEVER change across languages — only labels translate
    const stats: { value: number; labelKey: "stats.visits" | "stats.optimizations" | "stats.scriptsCreated" | "stats.downloads"; suffix?: string }[] = [
        { value: totalVisits, labelKey: "stats.visits" },
        { value: featuresCount, labelKey: "stats.optimizations", suffix: "+" },
        { value: totalScripts, labelKey: "stats.scriptsCreated" },
        { value: totalDownloads, labelKey: "stats.downloads" },
    ];

    return (
        <div className="flex items-center gap-4 sm:gap-7 animate-fade-in-up flex-wrap" style={{ animationDelay: "0.3s" }}>
            {stats.map((stat, i) => (
                <div key={stat.labelKey} className="flex items-center gap-4 sm:gap-7">
                    <div className="flex flex-col group">
                        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-[var(--accent-color)] transition-all duration-300">
                            <CountUp end={stat.value} formatter={stat.suffix ? undefined : formatStat} />{stat.suffix || ""}
                        </span>
                        <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] uppercase tracking-[0.15em] font-semibold mt-0.5 whitespace-nowrap">
                            {t[stat.labelKey]}
                        </span>
                    </div>
                    {i < stats.length - 1 && (
                        <div className="w-px h-10 sm:h-12 bg-gradient-to-b from-transparent via-[var(--accent-color)]/30 to-transparent"></div>
                    )}
                </div>
            ))}
        </div>
    );
}
