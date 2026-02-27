"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { TranslatableText } from "../shared/TranslatableText";

export function SearchBar() {
    const { searchQuery, setSearchQuery, selectedFeatures, lang } = useOptWinStore();

    return (
        <div className="relative w-full max-w-xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-secondary)] group-focus-within:text-[var(--accent-color)] transition-colors">
                <span className="material-symbols-outlined text-lg">search</span>
            </div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-36 py-3.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--accent-color)]/50 focus:border-[var(--accent-color)] transition-all shadow-sm"
                placeholder={lang === "tr" ? "Özellikleri ara..." : "Search features..."}
            />
            {/* Right side container to hold clear and badge together */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center justify-end gap-2 pointer-events-none">
                {searchQuery.length > 0 && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="pointer-events-auto flex items-center justify-center p-1.5 text-[var(--text-secondary)] hover:text-red-400 hover:bg-black/10 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                )}

                <div className={`pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-300 ${useOptWinStore(state => state.selectedFeatures.size) > 0 ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]/30 text-[var(--accent-color)] shadow-[0_0_10px_rgba(107,91,230,0.2)]' : 'bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
                    {useOptWinStore(state => state.selectedFeatures.size) > 0 && <span className="material-symbols-outlined text-[14px] animate-in zoom-in spin-in-12 duration-300">check_circle</span>}
                    <span className="text-xs font-bold whitespace-nowrap">
                        {useOptWinStore(state => state.selectedFeatures.size)} {lang === "tr" ? "seçildi" : "selected"}
                    </span>
                </div>
            </div>
        </div>
    );
}
