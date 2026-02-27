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
        <section className="relative w-full max-w-2xl mx-auto mt-10 mb-20 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-2xl relative overflow-hidden">

                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-[#6c5ce7]/5 pointer-events-none"></div>

                <div className="flex flex-col items-center text-center gap-2 relative z-10 w-full sm:w-1/2">
                    <div className="size-12 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] flex items-center justify-center mb-2 shadow-[0_0_15px_var(--accent-color)]/30">
                        <i className="fa-solid fa-globe text-xl"></i>
                    </div>
                    <span className="text-4xl font-extrabold text-[var(--text-primary)] font-mono tracking-tight">
                        {formatNumber(stats.visits)}
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                        <TranslatableText en="Total Visits" tr="Toplam Ziyaret" />
                    </span>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-24 bg-[var(--border-color)] relative z-10"></div>
                <div className="block sm:hidden h-px w-full bg-[var(--border-color)] relative z-10"></div>

                <div className="flex flex-col items-center text-center gap-2 relative z-10 w-full sm:w-1/2">
                    <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <i className="fa-solid fa-download text-xl"></i>
                    </div>
                    <span className="text-4xl font-extrabold text-[var(--text-primary)] font-mono tracking-tight">
                        {formatNumber(stats.downloads)}
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                        <TranslatableText en="Scripts Downloaded" tr="İndirilen Script" />
                    </span>
                </div>

            </div>
        </section>
    );
}
