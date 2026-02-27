"use client";

import { useEffect, useState } from "react";
import { TranslatableText } from "../shared/TranslatableText";

export function StatsSection() {
    // For Phase 1 we can mock these or fetch from an API later
    const [stats, setStats] = useState({ visits: 0, downloads: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Initial fetch
                const res = await fetch("/api/stats");
                const data = await res.json();
                if (data.success) {
                    setStats({ visits: data.totalVisits, downloads: data.totalScripts });
                }

                // Track visit
                await fetch("/api/stats?action=visit", { method: "POST" });
            } catch (err) {
                console.error("Failed to fetch/track stats", err);
            }
        };
        fetchStats();
    }, []);

    const formatNumber = (num: number) => num.toLocaleString();

    return (
        <section className="relative w-full max-w-lg mx-auto mt-8 mb-12 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl relative overflow-hidden backdrop-blur-xl">

                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-color)]/5 to-purple-500/5 pointer-events-none"></div>

                <div className="flex flex-col items-center text-center gap-1.5 relative z-10 w-full sm:w-1/2">
                    <div className="size-10 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center shadow-[0_0_10px_var(--accent-color)]/20">
                        <span className="material-symbols-outlined text-[20px]">public</span>
                    </div>
                    <span className="text-3xl font-extrabold text-[var(--text-primary)] font-mono tracking-tight">
                        {formatNumber(stats.visits)}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        <TranslatableText en="Total Visits" tr="Toplam Ziyaret" />
                    </span>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-16 bg-[var(--border-color)] relative z-10"></div>
                <div className="block sm:hidden h-px w-full bg-[var(--border-color)] relative z-10"></div>

                <div className="flex flex-col items-center text-center gap-1.5 relative z-10 w-full sm:w-1/2">
                    <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                    </div>
                    <span className="text-3xl font-extrabold text-[var(--text-primary)] font-mono tracking-tight">
                        {formatNumber(stats.downloads)}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        <TranslatableText en="Scripts Downloaded" tr="İndirilen Script" />
                    </span>
                </div>

            </div>
        </section>
    );
}
