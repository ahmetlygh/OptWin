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
    // mobileHidden: true = hidden on mobile, only show on sm+
    const stats: { value: number; labelKey: "stats.visits" | "stats.optimizations" | "stats.scriptsCreated" | "stats.downloads"; suffix?: string; mobileHidden?: boolean }[] = [
        { value: totalVisits, labelKey: "stats.visits", mobileHidden: true },
        { value: featuresCount, labelKey: "stats.optimizations", suffix: "+" },
        { value: totalScripts, labelKey: "stats.scriptsCreated", mobileHidden: true },
        { value: totalDownloads, labelKey: "stats.downloads" },
    ];

    return (
        <div className="flex items-end gap-4 sm:gap-7 animate-fade-in-up flex-wrap mt-auto" style={{ animationDelay: "0.3s" }}>
            {stats.map((stat, i) => (
                <div key={stat.labelKey} className={`items-end gap-4 sm:gap-7 ${stat.mobileHidden ? "hidden sm:flex" : "flex"}`}>
                    <div className="flex flex-col justify-end group">
                        <span className="text-2xl sm:text-3xl font-extrabold text-(--text-primary) tracking-tight group-hover:text-(--accent-color) transition-all duration-300 leading-none">
                            <CountUp end={stat.value} formatter={stat.suffix ? undefined : formatStat} />{stat.suffix || ""}
                        </span>
                        <span className="text-xs sm:text-sm text-(--text-primary)/90 uppercase tracking-widest font-bold mt-1.5 whitespace-nowrap leading-none drop-shadow-sm">
                            {t[stat.labelKey]}
                        </span>
                    </div>
                    {i < stats.length - 1 && (
                        <div className={`w-px h-10 sm:h-12 bg-linear-to-b from-transparent via-(--accent-color)/30 to-transparent shrink-0 ${stat.mobileHidden ? "hidden sm:block" : ""}`}></div>
                    )}
                </div>
            ))}
        </div>
    );
}
