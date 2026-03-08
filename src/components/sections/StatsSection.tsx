"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useEffect, useState } from "react";
import { GlobeIcon, DownloadIcon, TerminalIcon } from "../shared/Icons";

interface StatsData {
    totalVisits: number;
    totalScripts: number;
    totalDownloads: number;
}

export function StatsSection() {
    const { t } = useTranslation();
    const [stats, setStats] = useState<StatsData>({ totalVisits: 0, totalScripts: 0, totalDownloads: 0 });

    useEffect(() => {
        fetch("/api/stats")
            .then(r => r.json())
            .then(data => setStats({
                totalVisits: data.totalVisits || 0,
                totalScripts: data.totalScripts || 0,
                totalDownloads: data.totalDownloads || 0,
            }))
            .catch(() => { });
    }, []);

    const formatNumber = (n: number) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
        if (n >= 1000) return (n / 1000).toFixed(1) + "K";
        return n.toLocaleString();
    };

    const statItems = [
        { icon: <GlobeIcon size={20} />, value: stats.totalVisits, label: t["stats.totalVisits"], color: "from-blue-500/20 to-blue-500/5" },
        { icon: <TerminalIcon size={20} />, value: stats.totalScripts, label: t["stats.scriptsCreated"], color: "from-[var(--accent-color)]/20 to-[var(--accent-color)]/5" },
        { icon: <DownloadIcon size={20} />, value: stats.totalDownloads, label: t["stats.downloads"], color: "from-emerald-500/20 to-emerald-500/5" },
    ];

    return (
        <section className="w-full animate-fade-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statItems.map((stat, i) => (
                    <div
                        key={i}
                        className="relative overflow-hidden bg-[var(--card-bg)]/80 border border-[var(--border-color)] rounded-2xl p-5 flex items-center gap-4 group hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.15)] transition-all duration-300"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                        <div className="size-12 rounded-xl bg-[var(--border-color)] flex items-center justify-center text-[var(--accent-color)] shrink-0 relative z-10 group-hover:scale-110 transition-transform duration-300">
                            {stat.icon}
                        </div>
                        <div className="relative z-10">
                            <div className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tabular-nums tracking-tight">
                                {formatNumber(stat.value)}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider mt-0.5">
                                {stat.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
