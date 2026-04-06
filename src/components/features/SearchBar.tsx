"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { SearchIcon, XIcon, CheckCircleIcon, EyeOffIcon } from "../shared/Icons";
import { Eye } from "lucide-react";

export function SearchBar() {
    const searchQuery = useOptWinStore(state => state.searchQuery);
    const setSearchQuery = useOptWinStore(state => state.setSearchQuery);
    const selectedCount = useOptWinStore(state => Object.keys(state.selectedFeatures).length);
    const showDescriptions = useOptWinStore(state => state.showDescriptions);
    const toggleDescriptions = useOptWinStore(state => state.toggleDescriptions);
    const { t } = useTranslation();

    return (
        <div className="relative w-full max-w-2xl lg:max-w-3xl mx-auto group animate-fade-in-up flex items-center gap-2">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-(--text-secondary) group-focus-within:text-(--accent-color) transition-colors duration-300">
                    <SearchIcon size={18} />
                </div>
                <input
                    type="text"
                    id="feature-search"
                    name="search"
                    aria-label={t["search.placeholder"]}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-24 sm:pr-36 py-2.5 bg-[#0d0d12]/80 backdrop-blur-md border border-white/10 rounded-full text-(--text-primary) placeholder-(--text-secondary) focus:outline-none focus:border-(--accent-color)/60 focus:shadow-[0_0_0_3px_rgba(107,91,230,0.15)] shadow-sm transition-all duration-300 text-[14px]"
                    placeholder={t["search.placeholder"]}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center justify-end gap-2 pointer-events-none">
                    {searchQuery.length > 0 && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="pointer-events-auto cursor-pointer flex items-center justify-center p-1.5 text-(--text-secondary) hover:text-red-400 hover:bg-white/5 rounded-lg transition-all duration-200 animate-pop-in"
                        >
                            <XIcon size={18} />
                        </button>
                    )}
                    <div
                        className={`pointer-events-auto flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border transition-all duration-300 ${selectedCount > 0 ? 'bg-(--accent-color)/10 border-(--accent-color)/30 text-(--accent-color) shadow-[0_0_10px_rgba(107,91,230,0.2)]' : 'bg-(--bg-color) border-(--border-color) text-(--text-secondary)'}`}
                    >
                        {selectedCount > 0 && <CheckCircleIcon size={14} className="animate-pop-in" />}
                        <span className="text-xs font-bold whitespace-nowrap hidden sm:inline">
                            {selectedCount} {t["search.selected"]}
                        </span>
                        <span className="text-xs font-bold tabular-nums sm:hidden">{selectedCount}</span>
                    </div>
                </div>
            </div>

            {/* Toggle descriptions button — with text label */}
            <button
                onClick={toggleDescriptions}
                className={`shrink-0 h-[38px] cursor-pointer flex items-center gap-2 px-4 rounded-full border transition-all duration-300 ${showDescriptions
                    ? 'bg-(--card-bg)/50 border-white/10 text-(--text-secondary) hover:text-white'
                    : 'bg-(--accent-color)/10 border-(--accent-color)/30 text-(--accent-color)'
                    }`}
                title={showDescriptions ? t["search.hideDesc"] : t["search.showDesc"]}
            >
                {showDescriptions ? <EyeOffIcon size={18} /> : <Eye size={18} />}
                <span className="text-xs font-bold whitespace-nowrap hidden sm:inline">
                    {showDescriptions ? t["search.hideDesc"] : t["search.showDesc"]}
                </span>
            </button>
        </div>
    );
}
