"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { TranslatableText } from "../shared/TranslatableText";

export function SearchBar() {
    const { searchQuery, setSearchQuery, selectedFeatures, lang } = useOptWinStore();

    return (
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto w-full mb-8">

            {/* Search Input */}
            <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-magnifying-glass text-[var(--text-secondary)] group-focus-within:text-[var(--accent-color)] transition-colors text-sm"></i>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] pl-9 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:border-[var(--accent-color)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)]/70 transition-all shadow-sm"
                    placeholder={lang === "tr" ? "Özellikleri ara..." : "Search features..."}
                />
                {searchQuery.length > 0 && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                    >
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                )}
            </div>

            {/* Selected Count Indicator */}
            <div className="shrink-0 flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border-color)] px-4 py-2.5 rounded-xl shadow-sm">
                <i className="fa-solid fa-check-circle text-[var(--accent-color)] text-sm"></i>
                <span className="text-[var(--text-primary)] text-sm font-semibold whitespace-nowrap">
                    {selectedFeatures.size} <TranslatableText en="features selected" tr="özellik seçildi" />
                </span>
            </div>

        </section>
    );
}
