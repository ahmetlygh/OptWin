"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { SearchIcon, XIcon, CheckCircleIcon, EyeOffIcon } from "../shared/Icons";
import { Eye } from "lucide-react";

import { useEffect, useRef } from "react";

export function SearchBar() {
    const searchQuery = useOptWinStore(state => state.searchQuery);
    const setSearchQuery = useOptWinStore(state => state.setSearchQuery);
    const selectedCount = useOptWinStore(state => Object.keys(state.selectedFeatures).length);
    const showDescriptions = useOptWinStore(state => state.showDescriptions);
    const toggleDescriptions = useOptWinStore(state => state.toggleDescriptions);
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                if (inputRef.current) {
                    const targetRect = inputRef.current.getBoundingClientRect();
                    const targetY = window.pageYOffset + targetRect.top - (window.innerHeight / 2) + (targetRect.height / 2);
                    
                    const startY = window.pageYOffset;
                    const distance = targetY - startY;
                    const duration = 800; // Fixed 800ms duration ensures smooth, uniform scrolling speed
                    
                    let start: number | null = null;
                    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
                    
                    const step = (timestamp: number) => {
                        if (!start) start = timestamp;
                        const progress = timestamp - start;
                        const percent = Math.min(progress / duration, 1);
                        
                        window.scrollTo(0, startY + distance * easeOutCubic(percent));
                        
                        if (progress < duration) {
                            requestAnimationFrame(step);
                        } else {
                            setTimeout(() => inputRef.current?.focus(), 10);
                        }
                    };
                    
                    requestAnimationFrame(step);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="relative w-full max-w-xl lg:max-w-2xl mx-auto group animate-fade-in-up flex items-center gap-2">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-(--text-secondary) group-focus-within:text-(--accent-color) transition-colors duration-300 z-10">
                    <SearchIcon size={18} />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    id="feature-search"
                    name="search"
                    aria-label={t["search.placeholder"]}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full h-11 pl-11 pr-24 sm:pr-36 bg-(--card-bg) backdrop-blur-md border border-(--border-color) hover:border-(--border-color)/80 rounded-2xl text-(--text-primary) placeholder-(--text-secondary) focus:!outline-none focus-visible:!outline-none focus:ring-0 focus:!border-(--accent-color) focus-visible:!rounded-2xl transition-all duration-300 text-[14px] relative z-0"
                    placeholder={t["search.placeholder"]}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center justify-end gap-2 pointer-events-none">
                    {searchQuery.length > 0 && (
                        <button
                            onClick={() => setSearchQuery("")}
                            aria-label={t["search.clearSearch"]}
                            title={t["search.clearSearch"]}
                            className="pointer-events-auto cursor-pointer flex items-center justify-center p-1.5 text-(--text-secondary) hover:text-red-400 hover:bg-(--text-secondary)/10 rounded-lg transition-all duration-200 animate-pop-in"
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

            {/* Toggle descriptions button — synced with Sidebar */}
            <button
                onClick={toggleDescriptions}
                className={`shrink-0 cursor-pointer flex items-center justify-center gap-2 px-4 h-11 rounded-2xl border transition-all duration-300 text-[12px] font-bold outline-none focus-visible:outline-none focus-visible:!rounded-2xl ${showDescriptions
                    ? 'bg-(--card-bg) border-(--border-color) text-(--text-secondary) hover:text-(--text-primary)'
                    : 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
                }`}
            >
                {showDescriptions ? <EyeOffIcon size={16} /> : <Eye size={16} />}
                <span className="whitespace-nowrap hidden sm:inline">
                    {showDescriptions ? (t["common.hideDescriptions"] || "Açıklamaları Gizle") : (t["common.showDescriptions"] || "Açıklamaları Göster")}
                </span>
            </button>
        </div>
    );
}
