"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { FeatureCard } from "./FeatureCard";
import { Feature } from "@/types/feature";
import { CategoryIcon, ChevronDownIcon, CheckAllIcon, XIcon, EyeOffIcon } from "../shared/Icons";
import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { PresetButtonsList, GlobalActionButtons } from "../layout/PresetControls";
import { DnsProvider } from "@/types/feature";
import { motion, AnimatePresence } from "framer-motion";
import { Eye as EyeIcon } from "lucide-react";

type CategoryData = {
    id: string;
    slug: string;
    icon: string | null;
    translations: { lang: string; name: string }[];
    features: Feature[];
};

export function FeatureGridClient({ categories, presets, allFeatureSlugs, dnsProviders }: { categories: CategoryData[], presets: any[], allFeatureSlugs: string[], dnsProviders: DnsProvider[] }) {
    const searchQuery = useOptWinStore(state => state.searchQuery);
    const lang = useOptWinStore(state => state.lang);
    const collapsedCategories = useOptWinStore(state => state.collapsedCategories);
    const toggleCategoryCollapse = useOptWinStore(state => state.toggleCategoryCollapse);
    const selectedFeatures = useOptWinStore(state => state.selectedFeatures);
    const isTopPanelStuck = useOptWinStore(state => state.isTopPanelStuck);
    const toggleFeature = useOptWinStore(state => state.toggleFeature);
    const setCollapsedCategories = useOptWinStore(state => state.setCollapsedCategories);
    const showDescriptions = useOptWinStore(state => state.showDescriptions);
    const toggleDescriptions = useOptWinStore(state => state.toggleDescriptions);
    const { t } = useTranslation();
    const query = searchQuery.toLowerCase().trim();
    const [activeSection, setActiveSection] = useState<string>(categories[0]?.slug || "");

    const isScrollingRef = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: "-30% 0px -40% 0px",
            threshold: 0
        };

        const currentActive = new Set<string>();

        const observer = new IntersectionObserver((entries) => {
            let changed = false;
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    currentActive.add(entry.target.id);
                    changed = true;
                } else {
                    currentActive.delete(entry.target.id);
                    changed = true;
                }
            });

            if (changed && !isScrollingRef.current) {
                const activeId = categories.find(c => currentActive.has(c.slug))?.slug;
                if (activeId) setActiveSection(activeId);
            }
        }, observerOptions);

        setTimeout(() => {
            categories.forEach(cat => {
                const el = document.getElementById(cat.slug);
                if (el) observer.observe(el);
            });
        }, 100);

        return () => {
            observer.disconnect();
        };
    }, [categories, query]); // Re-attach when search changes

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

    // Scroll-preserving description toggle — keeps user at the same visual position
    const handleDescriptionToggle = useCallback(() => {
        const activeEl = document.getElementById(activeSection);
        if (activeEl) {
            isScrollingRef.current = true;
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = false; }, 800);

            const rectBefore = activeEl.getBoundingClientRect();
            const offsetBefore = rectBefore.top;
            toggleDescriptions();
            setTimeout(() => { // use setTimeout instead of requestAnimationFrame for layout shift stabilization
                const rectAfter = activeEl.getBoundingClientRect();
                const diff = rectAfter.top - offsetBefore;
                if (Math.abs(diff) > 1) {
                    window.scrollBy({ top: diff, behavior: 'instant' });
                }
            }, 50);
        } else {
            toggleDescriptions();
        }
    }, [activeSection, toggleDescriptions]);

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start relative w-full pb-10 lg:pr-36">
            {/* Sticky Sidebar Navigation for large screens */}
            <AnimatePresence>
                {filteredCategories.length > 0 && !query && (
                    <motion.div
                        initial={{ opacity: 0, x: -30, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: 256 }}
                        exit={{ opacity: 0, x: -30, width: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="hidden lg:block shrink-0 sticky top-24 self-start max-h-[calc(100vh-160px)] z-10 lg:-ml-36"
                    >
                        <div className="w-64 max-h-[calc(100vh-160px)] overflow-y-auto overflow-x-visible no-scrollbar border border-(--border-color) bg-(--card-bg)/30 backdrop-blur-md rounded-xl p-3 shadow-sm transition-all duration-300">
                            <div
                                className={`grid transition-[grid-template-rows,opacity] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                    isTopPanelStuck 
                                        ? "grid-rows-[1fr] opacity-100" 
                                        : "grid-rows-[0fr] opacity-0"
                                }`}
                            >
                            <div className="min-h-0 overflow-hidden">
                                <h4 className="text-[11px] font-black text-(--text-secondary)/60 uppercase tracking-[0.15em] mb-3 px-3 mt-1 text-center">
                                    {t["preset.sidebarTitle"] || "Hızlı Ayarlar"}
                                </h4>
                                <div className="mb-2.5 px-1">
                                    <PresetButtonsList presets={presets} allFeatureSlugs={allFeatureSlugs} layout="sidebar" />
                                </div>
                                <div className="w-full h-px bg-(--border-color)/50 my-1.5 opacity-50"></div>
                                <h4 className="text-[9px] font-bold text-(--text-secondary)/40 uppercase tracking-widest text-center mb-1.5 px-3 pt-0.5">
                                    {t["preset.bulkActionsTitle"] || "Toplu İşlemler"}
                                </h4>
                                <div className="mb-4 px-1">
                                    <GlobalActionButtons allCategorySlugs={categories.map(c => c.slug)} allFeatureSlugs={allFeatureSlugs} dnsProviders={dnsProviders} layout="sidebar" />
                                </div>
                                <hr className="border-(--border-color)/50 mb-3 mt-1 mx-3" />
                            </div>
                            </div>
                            <h4 className="text-[11px] font-black text-(--text-secondary)/60 uppercase tracking-[0.15em] mb-3 px-3 text-center">
                                {t["category.sidebarTitle"] || "Kategoriler"}
                            </h4>
                            <nav className="flex flex-col gap-1 relative z-0">
                                {activeSection && filteredCategories.findIndex((c) => c.slug === activeSection) !== -1 && (
                                    <div
                                        className="absolute left-0 w-full bg-(--accent-color)/15 rounded-lg transition-transform duration-300 ease-out pointer-events-none -z-10"
                                        style={{
                                            height: "40px",
                                            transform: `translateY(${filteredCategories.findIndex(c => c.slug === activeSection) * 44}px)`
                                        }}
                                    />
                                )}
                                {filteredCategories.map((cat) => {
                                   const catName = getCategoryName(cat);
                                   const isCatCollapsed = collapsedCategories.has(cat.slug);
                                   const hitCount = getSelectedCount(cat);
                                   const isCatActive = activeSection === cat.slug;
                                   return (
                                       <button 
                                         type="button"
                                         key={`nav-${cat.slug}`} 
                                         onClick={(e) => {
                                             e.preventDefault();
                                             if(isCatCollapsed) toggleCategoryCollapse(cat.slug);

                                             isScrollingRef.current = true;
                                             if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                                             scrollTimeoutRef.current = setTimeout(() => {
                                                 isScrollingRef.current = false;
                                             }, 800);

                                             setActiveSection(cat.slug);
                                              const el = document.getElementById(cat.slug);
                                              if(el) {
                                                  const offset = 96;
                                                  const targetY = el.getBoundingClientRect().top + window.pageYOffset - offset;
                                                  const startY = window.pageYOffset;
                                                  const distance = targetY - startY;
                                                  const duration = Math.min(Math.max(400, Math.abs(distance) * 0.45), 1000);
                                                  let start: number | null = null;
                                                  const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                                                  const step = (ts: number) => {
                                                      if (!start) start = ts;
                                                      const p = Math.min((ts - start) / duration, 1);
                                                      window.scrollTo(0, startY + distance * ease(p));
                                                      if (p < 1) requestAnimationFrame(step);
                                                  };
                                                  requestAnimationFrame(step);
                                              }
                                         }}
                                         className={`group flex items-center justify-between w-full cursor-pointer text-left text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors duration-200 relative outline-none z-10 ${isCatActive ? 'text-(--accent-color)' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--border-color)/30'}`}
                                       >
                                         <div className="flex items-center gap-2.5 relative z-10">
                                             <CategoryIcon icon={cat.icon} size={16} className={isCatActive || hitCount > 0 ? "text-(--accent-color)" : ""} />
                                             <span className="truncate">{catName}</span>
                                         </div>
                                         {hitCount > 0 && <span className="relative z-10 text-[10px] bg-(--accent-color)/15 text-(--accent-color) px-1.5 py-0.5 rounded-full font-bold">{hitCount}</span>}
                                       </button>
                                   );
                                })}
                            </nav>
                            {/* Açıklamaları Göster/Gizle — matching SearchBar design */}
                            <div className="w-full h-px bg-(--border-color)/40 my-3"></div>
                            <button
                                onClick={handleDescriptionToggle}
                                className={`cursor-pointer w-full h-[34px] flex items-center justify-center gap-2 px-3 rounded-xl border transition-all duration-300 text-[11px] font-bold outline-none focus-visible:outline-none focus-visible:!rounded-xl ${showDescriptions
                                    ? 'bg-(--card-bg) border-(--border-color) text-(--text-secondary) hover:text-(--text-primary)'
                                    : 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
                                }`}
                            >
                                {showDescriptions ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                                <span className="whitespace-nowrap">{showDescriptions ? (t["common.hideDescriptions"] || "Açıklamaları Gizle") : (t["common.showDescriptions"] || "Açıklamaları Göster")}</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }} className="flex-1 w-full min-w-0 space-y-12 scroll-mt-32">
            

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
                        className="animate-fade-in-up scroll-mt-24"
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
                                    className={`cursor-pointer disabled:cursor-default flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 border shadow-sm ${allSelected
                                        ? 'border-(--border-color)/50 bg-transparent text-(--text-secondary)/40 shadow-none'
                                        : 'border-(--border-color) bg-(--card-bg) text-(--text-secondary) hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400'
                                        }`}
                                    title={t["category.selectAll"] || "Select all"}
                                    disabled={allSelected}
                                >
                                    <CheckAllIcon size={14} />
                                    <span>{t["category.selectAll"] || "Select All"}</span>
                                </button>
                                <button
                                    onClick={(e) => deselectAllInCategory(cat, e)}
                                    className={`cursor-pointer disabled:cursor-default flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 border shadow-sm ${selectedCount === 0
                                        ? 'border-(--border-color)/50 bg-transparent text-(--text-secondary)/40 shadow-none'
                                        : 'border-(--border-color) bg-(--card-bg) text-(--text-secondary) hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
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
            </motion.div>
        </div>
    );
}
