"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { FeatureCard } from "./FeatureCard";
import { Feature } from "@/types/feature";
import { CategoryIcon, ChevronDownIcon, CheckAllIcon, XIcon } from "../shared/Icons";
import { useTranslation } from "@/i18n/useTranslation";

type CategoryData = {
    id: string;
    slug: string;
    icon: string | null;
    translations: { lang: string; name: string }[];
    features: Feature[];
};

export function FeatureGridClient({ categories }: { categories: CategoryData[] }) {
    const searchQuery = useOptWinStore(state => state.searchQuery);
    const lang = useOptWinStore(state => state.lang);
    const collapsedCategories = useOptWinStore(state => state.collapsedCategories);
    const toggleCategoryCollapse = useOptWinStore(state => state.toggleCategoryCollapse);
    const selectedFeatures = useOptWinStore(state => state.selectedFeatures);
    const toggleFeature = useOptWinStore(state => state.toggleFeature);
    const setCollapsedCategories = useOptWinStore(state => state.setCollapsedCategories);
    const { t } = useTranslation();
    const query = searchQuery.toLowerCase().trim();

    const expandAll = () => setCollapsedCategories([]);
    const collapseAll = () => setCollapsedCategories(categories.map(c => c.slug));

    const filteredCategories = categories.map(cat => {
        const filteredFeatures = cat.features.filter(f => {
            if (!query) return true;
            const matchesAnyTranslation = f.translations?.some((tr) =>
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
        return cat.features.filter(f => !!selectedFeatures[f.slug]).length;
    };

    // Check "effectively all selected" — skip mutually exclusive features
    const isEffectivelyAllSelected = (cat: CategoryData) => {
        const selectableFeatures = cat.features.filter(f => {
            // If ultimatePerformance is selected, highPerformance can't be selected (mutual exclusion)
            if (f.slug === "highPerformance" && !!selectedFeatures["ultimatePerformance"]) return false;
            if (f.slug === "ultimatePerformance" && !!selectedFeatures["highPerformance"]) return false;
            return true;
        });
        return selectableFeatures.every(f => !!selectedFeatures[f.slug]);
    };

    const selectAllInCategory = (cat: CategoryData, e: React.MouseEvent) => {
        e.stopPropagation();
        cat.features.forEach(f => {
            if (!selectedFeatures[f.slug]) {
                toggleFeature(f.slug);
            }
        });
    };

    const deselectAllInCategory = (cat: CategoryData, e: React.MouseEvent) => {
        e.stopPropagation();
        cat.features.forEach(f => {
            if (selectedFeatures[f.slug]) {
                toggleFeature(f.slug);
            }
        });
    };

    return (
        <div className="w-full space-y-12">
            {/* Collapse/Expand All Categories Toggle */}
            <div className="flex justify-end gap-3 mb-4 mt-6 relative z-20 animate-fade-in-up">
                <button
                    onClick={collapseAll}
                    disabled={collapsedCategories.size === categories.length}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-(--border-color) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--card-bg) hover:border-(--accent-color)/30 disabled:opacity-50 disabled:hover:border-(--border-color) disabled:hover:bg-transparent disabled:hover:text-(--text-secondary) transition-all duration-200"
                >
                    {t["category.collapseAll"] || "Collapse All"}
                </button>
                <button
                    onClick={expandAll}
                    disabled={collapsedCategories.size === 0}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-(--border-color) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--card-bg) hover:border-(--accent-color)/30 disabled:opacity-50 disabled:hover:border-(--border-color) disabled:hover:bg-transparent disabled:hover:text-(--text-secondary) transition-all duration-200"
                >
                    {t["category.expandAll"] || "Expand All"}
                </button>
            </div>

            {filteredCategories.length === 0 && query && (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-(--card-bg) border border-(--border-color) rounded-2xl animate-fade-in-up">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-(--text-secondary) mb-4 opacity-50"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    <h3 className="text-xl font-bold text-(--text-primary) mb-2">
                        {t["search.noResults"]}
                    </h3>
                    <button
                        onClick={() => useOptWinStore.getState().setSearchQuery("")}
                        className="mt-4 px-5 py-2.5 bg-[#6c5ce7]/15 text-[#6c5ce7] font-bold rounded-xl hover:bg-[#6c5ce7] hover:text-white transition-all duration-300"
                    >
                        {t["search.clearSearch"]}
                    </button>
                </div>
            )}

            {filteredCategories.map((cat, catIdx) => {
                const isCollapsed = collapsedCategories.has(cat.slug);
                const catName = getCategoryName(cat);
                const selectedCount = getSelectedCount(cat);
                const totalCount = cat.features.length;
                const allSelected = isEffectivelyAllSelected(cat);

                return (
                    <section
                        key={`${cat.id}-${query}`}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${catIdx * 0.06}s` }}
                        id={cat.slug}
                    >
                        {/* Category header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-3 mb-5 w-full group">
                            <button
                                onClick={() => toggleCategoryCollapse(cat.slug)}
                                className="flex items-center gap-3 flex-1 cursor-pointer w-full text-left"
                            >
                                <CategoryIcon icon={cat.icon} className="text-(--accent-color) shrink-0" />
                                <h3 className="text-xl font-bold text-(--text-primary) whitespace-normal sm:whitespace-nowrap shrink-0">
                                    {catName}
                                </h3>
                                <span className={`text-xs font-semibold tabular-nums transition-colors duration-200 shrink-0 ${selectedCount > 0 ? 'text-(--accent-color)' : 'text-(--text-secondary)'}`}>
                                    ({selectedCount}/{totalCount})
                                </span>
                                <div className="hidden sm:block h-px flex-1 bg-(--border-color)"></div>
                                <div className={`text-(--text-secondary) group-hover:text-(--accent-color) transition-all duration-300 ml-auto sm:ml-0 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}>
                                    <ChevronDownIcon size={18} />
                                </div>
                            </button>

                            {/* Select all / Deselect all buttons */}
                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto shrink-0">
                                <button
                                    onClick={(e) => selectAllInCategory(cat, e)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors duration-200 ${allSelected
                                        ? 'text-(--accent-color)/40 cursor-default'
                                        : 'text-(--text-secondary) hover:bg-(--accent-color)/15 hover:text-(--accent-color)'
                                        }`}
                                    title={t["category.selectAll"] || "Select all"}
                                    disabled={allSelected}
                                >
                                    <CheckAllIcon size={14} />
                                    <span>{t["category.selectAll"] || "Select All"}</span>
                                </button>
                                <button
                                    onClick={(e) => deselectAllInCategory(cat, e)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors duration-200 ${selectedCount === 0
                                        ? 'text-(--text-secondary)/40 cursor-default'
                                        : 'text-(--text-secondary) hover:bg-red-500/15 hover:text-red-400'
                                        }`}
                                    title={t["category.deselectAll"] || "Deselect all"}
                                    disabled={selectedCount === 0}
                                >
                                    <XIcon size={14} />
                                    <span>{t["category.deselectAll"] || "Clear"}</span>
                                </button>
                            </div>
                        </div>

                        {/* Features grid — CSS grid animation */}
                        <div
                            className="grid transition-[grid-template-rows,opacity] duration-350 ease-in-out"
                            style={{
                                gridTemplateRows: isCollapsed ? '0fr' : '1fr',
                                opacity: isCollapsed ? 0 : 1,
                            }}
                        >
                            <div className="overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1 stagger-children">
                                    {cat.features.map((f) => (
                                        <FeatureCard key={f.id} feature={f} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
