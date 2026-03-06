"use client";

import { CountUp } from "../shared/CountUp";
import { TranslatableText } from "../shared/TranslatableText";

interface HeroStatsProps {
    totalVisits: number;
    totalScripts: number;
    featuresCount: number;
}

export function HeroStats({ totalVisits, totalScripts, featuresCount }: HeroStatsProps) {
    const formatStat = (n: number) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + "M+";
        if (n >= 1000) return (n / 1000).toFixed(1) + "K+";
        return n.toString();
    };

    return (
        <div className="flex items-center gap-5 sm:gap-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            {/* Stat 1: Visits */}
            <div className="flex flex-col group">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-[var(--accent-color)] transition-all duration-300">
                    <CountUp end={totalVisits} formatter={formatStat} />
                </span>
                <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] uppercase tracking-[0.15em] font-semibold mt-0.5">
                    <TranslatableText en="Visits" tr="Ziyaret" noSpan />
                </span>
            </div>

            <div className="w-px h-10 sm:h-12 bg-gradient-to-b from-transparent via-[var(--accent-color)]/30 to-transparent"></div>

            {/* Stat 2: Downloads (Scripts) */}
            <div className="flex flex-col group">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-[var(--accent-color)] transition-all duration-300">
                    <CountUp end={totalScripts} formatter={formatStat} />
                </span>
                <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] uppercase tracking-[0.15em] font-semibold mt-0.5">
                    <TranslatableText en="Downloads" tr="İndirme" noSpan />
                </span>
            </div>

            <div className="w-px h-10 sm:h-12 bg-gradient-to-b from-transparent via-[var(--accent-color)]/30 to-transparent"></div>

            {/* Stat 3: Total Optimizations */}
            <div className="flex flex-col group">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-[var(--accent-color)] transition-all duration-300">
                    <CountUp end={featuresCount} />+
                </span>
                <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] uppercase tracking-[0.15em] font-semibold mt-0.5">
                    <TranslatableText en="Optimizations" tr="Optimizasyon" noSpan />
                </span>
            </div>
        </div>
    );
}
