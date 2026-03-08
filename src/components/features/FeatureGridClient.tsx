"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { FeatureCard } from "./FeatureCard";
import { Feature } from "@/types/feature";
import { CategoryIcon, ChevronDownIcon, CheckAllIcon, XIcon } from "../shared/Icons";
import { useState, useRef, useEffect } from "react";

type CategoryData = {
    id: string;
    slug: string;
    icon: string | null;
    translations: { lang: string; name: string }[];
    features: any[];
};

export function FeatureGridClient({ categories }: { categories: CategoryData[] }) {
    const searchQuery = useOptWinStore(state => state.searchQuery);
    const lang = useOptWinStore(state => state.lang);
    const collapsedCategories = useOptWinStore(state => state.collapsedCategories);
    const toggleCategoryCollapse = useOptWinStore(state => state.toggleCategoryCollapse);
    const selectedFeatures = useOptWinStore(state => state.selectedFeatures);
    const toggleFeature = useOptWinStore(state => state.toggleFeature);
    const query = searchQuery.toLowerCase().trim();

    const filteredCategories = categories.map(cat => {
        const filteredFeatures = cat.features.filter(f => {
            if (!query) return true;
            const matchesAnyTranslation = f.translations?.some((tr: any) =>
                (tr.title?.toLowerCase() || "").includes(query) ||
                (tr.desc?.toLowerCase() || "").includes(query)
            );
            return matchesAnyTranslation || f.slug.toLowerCase().includes(query);
        });
        return { ...cat, features: filteredFeatures };
    }).filter(cat => cat.features.length > 0);

    const getCategoryName = (cat: CategoryData) => {
        return cat.translations.find(t => t.lang === lang)?.name
            || cat.translations.find(t => t.lang === "en")?.name
            || cat.slug;
    };

    const getSelectedCount = (cat: CategoryData) => {
        return cat.features.filter(f => selectedFeatures.has(f.slug)).length;
    };

    const selectAllInCategory = (cat: CategoryData, e: React.MouseEvent) => {
        e.stopPropagation();
        cat.features.forEach(f => {
            if (!selectedFeatures.has(f.slug)) {
                toggleFeature(f.slug);
            }
        });
    };

    const deselectAllInCategory = (cat: CategoryData, e: React.MouseEvent) => {
        e.stopPropagation();
        cat.features.forEach(f => {
            if (selectedFeatures.has(f.slug)) {
                toggleFeature(f.slug);
            }
        });
    };

    return (
        <div className="w-full space-y-12">
            {filteredCategories.length === 0 && query && (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl animate-fade-in-up">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)] mb-4 opacity-50"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                        {lang === "tr" ? "Sonuç bulunamadı." : "No results found."}
                    </h3>
                </div>
            )}

            {filteredCategories.map((cat, catIdx) => {
                const isCollapsed = collapsedCategories.has(cat.slug);
                const catName = getCategoryName(cat);
                const selectedCount = getSelectedCount(cat);
                const totalCount = cat.features.length;
                const allSelected = selectedCount === totalCount;

                return (
                    <CategorySection
                        key={`${cat.id}-${query}`}
                        cat={cat}
                        catIdx={catIdx}
                        isCollapsed={isCollapsed}
                        catName={catName}
                        selectedCount={selectedCount}
                        totalCount={totalCount}
                        allSelected={allSelected}
                        toggleCategoryCollapse={toggleCategoryCollapse}
                        selectAllInCategory={selectAllInCategory}
                        deselectAllInCategory={deselectAllInCategory}
                    />
                );
            })}
        </div>
    );
}

/** Category section with animated collapse */
function CategorySection({
    cat, catIdx, isCollapsed, catName, selectedCount, totalCount, allSelected,
    toggleCategoryCollapse, selectAllInCategory, deselectAllInCategory,
}: {
    cat: any; catIdx: number; isCollapsed: boolean; catName: string;
    selectedCount: number; totalCount: number; allSelected: boolean;
    toggleCategoryCollapse: (slug: string) => void;
    selectAllInCategory: (cat: any, e: React.MouseEvent) => void;
    deselectAllInCategory: (cat: any, e: React.MouseEvent) => void;
}) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState<number | "auto">("auto");
    const [shouldRender, setShouldRender] = useState(!isCollapsed);

    // Measure and animate
    useEffect(() => {
        if (!isCollapsed) {
            setShouldRender(true);
            // Wait for render, then measure and set height
            requestAnimationFrame(() => {
                if (contentRef.current) {
                    const h = contentRef.current.scrollHeight;
                    setContentHeight(0);
                    // Force layout then set actual height for animation
                    requestAnimationFrame(() => {
                        setContentHeight(h);
                        // After animation, set to auto for responsiveness
                        setTimeout(() => setContentHeight("auto"), 350);
                    });
                }
            });
        } else {
            // Collapsing: set current height, then 0
            if (contentRef.current) {
                const h = contentRef.current.scrollHeight;
                setContentHeight(h);
                requestAnimationFrame(() => {
                    setContentHeight(0);
                });
                // Fully unmount after animation
                setTimeout(() => setShouldRender(false), 350);
            } else {
                setShouldRender(false);
            }
        }
    }, [isCollapsed]);

    return (
        <section
            className="animate-fade-in-up"
            style={{ animationDelay: `${catIdx * 0.06}s` }}
            id={cat.slug}
        >
            {/* Category header */}
            <div className="flex items-center gap-3 mb-5 w-full group">
                <button
                    onClick={() => toggleCategoryCollapse(cat.slug)}
                    className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                >
                    <CategoryIcon icon={cat.icon} className="text-[var(--accent-color)]" />
                    <h3 className="text-xl font-bold text-[var(--text-primary)] whitespace-nowrap">
                        {catName}
                    </h3>
                    <span className={`text-xs font-semibold tabular-nums transition-colors duration-200 ${selectedCount > 0 ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)]'}`}>
                        ({selectedCount}/{totalCount})
                    </span>
                    <div className="h-px flex-1 bg-[var(--border-color)]"></div>
                    <div className={`text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] transition-all duration-300 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}>
                        <ChevronDownIcon size={18} />
                    </div>
                </button>

                {/* Select all / Deselect all buttons */}
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={(e) => selectAllInCategory(cat, e)}
                        className={`size-7 flex items-center justify-center rounded-lg transition-colors duration-200 ${allSelected
                            ? 'text-[var(--accent-color)]/40 cursor-default'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--accent-color)]/15 hover:text-[var(--accent-color)]'
                            }`}
                        title="Select all"
                        disabled={allSelected}
                    >
                        <CheckAllIcon size={14} />
                    </button>
                    <button
                        onClick={(e) => deselectAllInCategory(cat, e)}
                        className={`size-7 flex items-center justify-center rounded-lg transition-colors duration-200 ${selectedCount === 0
                            ? 'text-[var(--text-secondary)]/40 cursor-default'
                            : 'text-[var(--text-secondary)] hover:bg-red-500/15 hover:text-red-400'
                            }`}
                        title="Deselect all"
                        disabled={selectedCount === 0}
                    >
                        <XIcon size={14} />
                    </button>
                </div>
            </div>

            {/* Features grid — animated collapse */}
            <div
                ref={contentRef}
                className="overflow-hidden transition-[height,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                    height: contentHeight === "auto" ? "auto" : contentHeight,
                    opacity: isCollapsed ? 0 : 1,
                }}
            >
                {shouldRender && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                        {cat.features.map((f: any) => (
                            <FeatureCard key={f.id} feature={f as unknown as Feature} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
