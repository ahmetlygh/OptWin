"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { FeatureCard } from "./FeatureCard";
import { Feature } from "@/types/feature";
import { CategoryIcon, ChevronDownIcon } from "../shared/Icons";

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
    const query = searchQuery.toLowerCase().trim();

    const filteredCategories = categories.map(cat => {
        const filteredFeatures = cat.features.filter(f => {
            if (!query) return true;
            // Search across all available translations
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

                return (
                    <section
                        key={`${cat.id}-${query}`}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${catIdx * 0.06}s` }}
                        id={cat.slug}
                    >
                        {/* Category header — clickable to collapse */}
                        <button
                            onClick={() => toggleCategoryCollapse(cat.slug)}
                            className="flex items-center gap-3 mb-5 w-full group cursor-pointer"
                        >
                            <CategoryIcon icon={cat.icon} className="text-[var(--accent-color)]" />
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">
                                {catName}
                            </h3>
                            <span className="text-xs text-[var(--text-secondary)] font-semibold">
                                ({cat.features.length})
                            </span>
                            <div className="h-px flex-1 bg-[var(--border-color)]"></div>
                            <div className={`text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] transition-all duration-300 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}>
                                <ChevronDownIcon size={18} />
                            </div>
                        </button>

                        {/* Features grid — with animated collapse */}
                        <div
                            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] origin-top ${isCollapsed ? "max-h-0 opacity-0 overflow-hidden scale-y-0" : "max-h-[5000px] opacity-100 scale-y-100"}`}
                        >
                            {cat.features.map(f => (
                                <FeatureCard key={f.id} feature={f as unknown as Feature} />
                            ))}
                        </div>
                    </section>
                )
            })}
        </div>
    );
}
