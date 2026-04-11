"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { StarIcon, GamepadIcon, ResetIcon, CheckAllIcon, CheckIcon, GlobeIcon, XIcon } from "../shared/Icons";
import { useState } from "react";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { DnsProvider } from "@/types/feature";
import { DNS_DISPLAY_NAMES } from "@/lib/constants";
import { AnimatePresence, motion } from "framer-motion";

type PresetDef = {
    id: string;
    slug: string;
    featureSlugs: string[];
    translations: { lang: string; name: string; description?: string }[];
};

export function PresetButtonsList({ presets, allFeatureSlugs, layout = "topbar" }: { presets: PresetDef[], allFeatureSlugs: string[], layout?: "topbar" | "sidebar" }) {
    const { selectFeatures } = useOptWinStore();
    const { t, lang } = useTranslation();

    const handleApplyPreset = (featureSlugs: string[]) => {
        const validSlugs = featureSlugs.filter(s => allFeatureSlugs.includes(s));
        selectFeatures(validSlugs);
    };

    const getPresetButtonStyle = (slug: string) => {
        switch (slug) {
            case "recommended":
                return "bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]";
            case "gamer":
                return "bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]";
            default:
                return "border-(--border-color) bg-transparent text-(--text-secondary) hover:border-purple-500/30 hover:text-purple-400 hover:bg-purple-500/10 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]";
        }
    };

    const getPresetIcon = (slug: string) => {
        switch (slug) {
            case "recommended": return <StarIcon size={16} />;
            case "gamer": return <GamepadIcon size={16} />;
            default: return null;
        }
    };

    return (
        <div className={`flex w-full justify-center ${layout === "sidebar" ? "flex-col gap-2" : "flex-row flex-wrap gap-2.5"}`}>
            {presets.map((preset) => (
                <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.featureSlugs)}
                    className={`group relative items-center cursor-pointer flex justify-center gap-1.5 px-3 h-[34px] border rounded-xl text-[12px] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${getPresetButtonStyle(preset.slug)} ${layout === "topbar" ? "flex-1 min-w-[140px] max-w-[200px]" : "w-full"}`}
                >
                    <div className="flex items-center justify-center gap-2 font-bold w-full">
                        {getPresetIcon(preset.slug)}
                        <span className="truncate">
                            {t[`preset.${preset.slug}` as keyof typeof t] || preset.translations.find(tr => tr.lang === lang)?.name || preset.slug}
                        </span>
                    </div>
                    
                    <div className="absolute bottom-[calc(100%+8px)] w-48 bg-[#1a1a24] border border-(--accent-color)/30 px-3 py-2 rounded-xl shadow-xl shadow-(--accent-color)/10 z-9999 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 scale-95 group-hover:scale-100 pointer-events-none text-left">
                        <span className="text-[10px] text-white/70 block leading-tight font-medium opacity-90">
                            {(t as Record<string, string>)[`preset.${preset.slug}.desc`] || preset.translations.find(tr => tr.lang === lang)?.description || ""}
                        </span>
                        <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-(--accent-color)/30"></div>
                        <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#1a1a24]"></div>
                    </div>
                </button>
            ))}
        </div>
    );
}

export function GlobalActionButtons({ allCategorySlugs, allFeatureSlugs, dnsProviders, layout = "topbar" }: { allCategorySlugs: string[], allFeatureSlugs: string[], dnsProviders: DnsProvider[], layout?: "topbar" | "sidebar" }) {
    const { 
        showDescriptions, toggleDescriptions, collapsedCategories, setCollapsedCategories,
        selectFeatures, clearFeatures, showToast, dnsProvider, setDnsProvider, setDnsModalOpen, selectedFeatures 
    } = useOptWinStore();
    const { t } = useTranslation();

    const [dnsOpen, setDnsOpen] = useState(false);
    const [dnsEverShown, setDnsEverShown] = useState(false);

    const hasDnsSelected = !!selectedFeatures["changeDNS"];
    const showDnsBar = dnsEverShown && dnsOpen && hasDnsSelected;

    const collapseAll = () => setCollapsedCategories(allCategorySlugs);
    const expandAll = () => setCollapsedCategories([]);

    const handleSelectAll = () => {
        const filtered = allFeatureSlugs.filter(f => f !== "highPerformance");
        selectFeatures(filtered);
        showToast(t["preset.selectAllWarning"] || "Tüm özellikler seçildi. Lütfen listeyi gözden geçirin.", "warning");
        setDnsEverShown(true);
        setDnsOpen(true);
    };

    const handleClearAll = () => {
        clearFeatures();
        setDnsOpen(false);
    };

    const isSidebar = layout === "sidebar";

    const dnsComponent = (
        <div
            className={`w-full grid transition-[grid-template-rows,opacity,margin] duration-300 ${dnsEverShown && showDnsBar ? 'mt-3' : 'mt-0'}`}
            style={{
                gridTemplateRows: dnsEverShown && showDnsBar ? '1fr' : '0fr',
                opacity: dnsEverShown && showDnsBar ? 1 : 0,
                pointerEvents: dnsEverShown && showDnsBar ? 'auto' : 'none',
            }}
        >
            <div className="overflow-hidden">
                {/* Mobile: single "DNS Seç" button that opens modal */}
                <button
                    onClick={() => setDnsModalOpen(true)}
                    className="md:hidden w-full flex items-center justify-center gap-3 px-5 py-3 bg-(--card-bg) border border-(--accent-color)/30 rounded-2xl shadow-[0_0_20px_rgba(107,91,230,0.10)] active:scale-95 transition-all duration-200 cursor-pointer"
                >
                    <GlobeIcon size={16} className="text-(--accent-color)" />
                    <span className="text-sm font-bold text-(--text-primary)">
                        {t["dns.select"] || "DNS Seç"}
                    </span>
                    <span className="text-xs font-bold text-(--accent-color) bg-(--accent-color)/10 px-2.5 py-1 rounded-lg">
                        {DNS_DISPLAY_NAMES[dnsProvider] || dnsProvider}
                    </span>
                </button>

                {/* PC: full inline provider selector */}
                <div className={`hidden md:flex w-full bg-(--card-bg) border border-(--accent-color)/25 rounded-2xl p-2 shadow-[0_0_20px_rgba(107,91,230,0.08)] ${isSidebar ? "flex-col" : "items-center"}`}>
                    <div className={`flex items-center px-3 gap-2 shrink-0 ${isSidebar ? "h-8 border-b border-(--border-color) mb-1 pb-1" : "h-10 border-r border-(--border-color) mr-1"}`}>
                        <GlobeIcon size={15} className="text-(--accent-color)" />
                        <span className="text-[11px] font-bold text-(--text-secondary) uppercase tracking-wider">DNS</span>
                        {isSidebar && (
                            <button onClick={() => setDnsOpen(false)} className="ml-auto text-(--text-secondary) hover:text-red-400 cursor-pointer">
                                <XIcon size={14} />
                            </button>
                        )}
                    </div>

                    <div className={`w-full grid ${isSidebar ? "grid-cols-1 gap-1 p-1" : "grid-cols-2 sm:grid-cols-3 xl:flex xl:flex-1 gap-1.5"}`}>
                        {/* Default provider */}
                        <button
                            onClick={() => setDnsProvider("default")}
                            className={`cursor-pointer flex xl:flex-1 items-center justify-start gap-2 px-3 h-9 rounded-lg text-[13px] font-bold transition-all duration-200 ease-in-out whitespace-nowrap overflow-hidden ${dnsProvider === "default"
                                ? "bg-(--accent-color) text-white shadow-md shadow-(--accent-color)/30"
                                : "bg-transparent text-(--text-secondary) hover:bg-(--border-color) hover:text-(--text-primary)"}
                            `}
                        >
                            <div className={`flex items-center justify-center w-3.5 h-3.5 rounded-full border ${dnsProvider === "default" ? "border-white" : "border-(--text-secondary)"}`}>
                                {dnsProvider === "default" && <CheckIcon size={8} strokeWidth={4} />}
                            </div>
                            {t["preset.default"] || "Default"}
                        </button>

                        {dnsProviders.map(p => (
                            <button
                                key={p.slug}
                                onClick={() => setDnsProvider(p.slug)}
                                className={`cursor-pointer flex xl:flex-1 items-center justify-start gap-2 px-3 h-9 rounded-lg text-[13px] font-bold transition-all duration-200 ease-in-out whitespace-nowrap overflow-hidden ${dnsProvider === p.slug
                                    ? "bg-(--accent-color) text-white shadow-md shadow-(--accent-color)/30"
                                    : "bg-transparent text-(--text-secondary) hover:bg-(--border-color) hover:text-(--text-primary)"}
                                `}
                            >
                                <div className={`flex items-center justify-center w-3.5 h-3.5 rounded-full border ${dnsProvider === p.slug ? "border-white" : "border-(--text-secondary)"}`}>
                                    {dnsProvider === p.slug && <CheckIcon size={8} strokeWidth={4} />}
                                </div>
                                {p.name}
                            </button>
                        ))}
                    </div>

                    {!isSidebar && (
                        <div className="flex items-center pl-1.5 border-l border-(--border-color) shrink-0 ml-auto">
                            <button
                                onClick={() => setDnsOpen(false)}
                                className="cursor-pointer size-8 flex items-center justify-center rounded-lg text-(--text-secondary) hover:bg-red-500/15 hover:text-red-400 transition-colors duration-200"
                            >
                                <XIcon size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const selectedCount = Object.keys(selectedFeatures).length;

    return (
        <div className="flex flex-col w-full gap-2 animate-fade-in-up">
            <div className={`grid gap-2 ${isSidebar ? "grid-cols-2" : "grid-cols-2 lg:flex lg:flex-wrap"}`}>

                <button
                    onClick={collapseAll}
                    disabled={collapsedCategories.size === allCategorySlugs.length}
                    className={`cursor-pointer flex items-center justify-center gap-1.5 px-3 h-[34px] rounded-xl border border-(--border-color) bg-(--card-bg) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--border-color)/30 disabled:opacity-50 disabled:bg-transparent transition-colors duration-200 text-[12px] font-bold ${isSidebar ? "col-span-1 leading-tight text-center" : "flex-1 min-w-[120px]"}`}
                >
                    <ChevronsDownUp size={14} className="shrink-0" />
                    <span>{t["category.collapseAll"] || "Tümünü Daralt"}</span>
                </button>

                <button
                    onClick={expandAll}
                    disabled={collapsedCategories.size === 0}
                    className={`cursor-pointer flex items-center justify-center gap-1.5 px-3 h-[34px] rounded-xl border border-(--border-color) bg-(--card-bg) text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--border-color)/30 disabled:opacity-50 disabled:bg-transparent transition-colors duration-200 text-[12px] font-bold ${isSidebar ? "col-span-1 leading-tight text-center" : "flex-1 min-w-[120px]"}`}
                >
                    <ChevronsUpDown size={14} className="shrink-0" />
                    <span>{t["category.expandAll"] || "Tümünü Genişlet"}</span>
                </button>

                <AnimatePresence>
                    {selectedCount > 0 && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2, type: "spring", bounce: 0 }}
                            onClick={handleClearAll}
                            className={`cursor-pointer flex items-center justify-center gap-1.5 px-3 h-[34px] border border-(--border-color) bg-(--card-bg) text-(--text-secondary) hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-[12px] font-bold transition-colors duration-200 ${isSidebar ? "col-span-1" : "col-span-1 lg:flex-1 min-w-[100px]"}`}
                        >
                            <ResetIcon size={14} className="shrink-0" />
                            <span className="leading-tight text-center">{t["preset.clearAll"] || "Sıfırla"}</span>
                        </motion.button>
                    )}
                </AnimatePresence>

                <button
                    onClick={handleSelectAll}
                    className={`cursor-pointer flex items-center justify-center gap-1.5 px-3 h-[34px] border border-(--border-color) bg-(--card-bg) text-(--text-secondary) hover:border-purple-500/30 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl text-[12px] font-bold transition-colors duration-200 ${isSidebar ? (selectedCount > 0 ? "col-span-1" : "col-span-2") : (selectedCount > 0 ? "col-span-1 lg:flex-1 min-w-[100px]" : "col-span-2 lg:flex-1 min-w-[120px]")}`}
                >
                    <CheckAllIcon size={14} className="shrink-0" />
                    <span className="leading-tight text-center">{t["preset.selectAll"] || "Hepsini Seç"}</span>
                </button>

            </div>
            
            {dnsComponent}
        </div>
    );
}
