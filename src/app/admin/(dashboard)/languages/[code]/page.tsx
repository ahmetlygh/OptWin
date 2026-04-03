"use client";

import React, { use, useEffect, useState, useMemo, useDeferredValue, memo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
import { AdminActionBar } from "@/components/admin/AdminActionBar";
import { ArrowLeft, Bot, Globe, RefreshCw, Search, AlertCircle, Activity, Settings2, FileDown, FileUp, ChevronDown, ChevronRight, Layout, Sparkles, XCircle, Navigation2, X } from "lucide-react";
import { useOptWinStore } from "@/store/useOptWinStore";
import { FlagIcon } from "@/components/shared/FlagIcon";
import { Language } from "@/components/admin/languages/LanguageDashboard";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/shared/Loader";
import { LanguageEditorModal } from "@/components/admin/languages/LanguageEditorModal";
import { calculateProgress, SEO_KEYS, PAGE_KEYS, type ExtraProgressData } from "@/lib/translationUtils";

/* ── Shared neon input class ── */
const neonInput = "w-full bg-white/[0.02] backdrop-blur-md border border-white/[0.06] rounded-xl px-4 py-2.5 text-[12px] text-white placeholder-white/15 focus:outline-none focus:border-[#6b5be6]/70 focus:shadow-[0_0_15px_rgba(107,91,230,0.15)] focus:bg-white/[0.03] transition-all duration-300";

/* ── Task 1: SEO Live Preview ── */
const SeoPreview = ({ title, description, code }: { title: string; description: string; code: string }) => (
    <div className="mt-3 p-3 bg-white/[0.015] border border-white/[0.04] rounded-xl space-y-1">
        <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Google Önizleme</div>
        <p className="text-[13px] text-[#8ab4f8] font-medium truncate leading-snug">{title || "Sayfa Başlığı"}</p>
        <p className="text-[10px] text-emerald-400/70 truncate">optwin.tech/{code}</p>
        <p className="text-[11px] text-white/30 leading-relaxed line-clamp-2">{description || "Sayfa açıklaması burada görünecek..."}</p>
    </div>
);

/* ── Task 3 & 4: Structural JSON Editor (Values-Only) ── */
const SmartJsonEditor = memo(({ content, onUpdate, onRevert, searchTerm, showMissingOnly, originalTranslations, origSeoMeta, origPageTitles, highlightKey }: { content: string; onUpdate: (key: string, val: string) => void; onRevert: () => void; searchTerm: string; showMissingOnly: boolean; originalTranslations: Record<string, string>; origSeoMeta: any; origPageTitles: Record<string, string>; highlightKey?: string | null }) => {
    const [localData, setLocalData] = useState<Record<string, any>>({});
    const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

    useEffect(() => {
        try { setLocalData(JSON.parse(content)); } catch { setLocalData({}); }
    }, [content]);

    const handleChange = useCallback((key: string, val: string) => {
        setLocalData(prev => ({ ...prev, [key]: val }));
        
        // Push to parent immediately since the parent handles `jsonContent` efficiently now
        onUpdate(key, val);
    }, [onUpdate]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onRevert();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onRevert]);

    const term = (searchTerm || "").toLowerCase();

    return (
        <div className="font-mono text-[13px] leading-relaxed p-8 custom-scrollbar min-h-full bg-black/[0.1]">
            <div className="text-white/30">{'{'}</div>
            {Object.entries(localData).map(([key, val], i) => {
                if (key === "_config.order") return null;
                const termMatch = term && (key.toLowerCase().includes(term) || String(val).toLowerCase().includes(term));
                const isEmptyNow = val === undefined || val === null || String(val).trim() === "";

                // 1. Handle Config Keys (_config.*)
                if (key.startsWith("_config.")) {
                    const isMissingModeActive = showMissingOnly;
                    // If missing mode is on, ONLY show if it's actually empty.
                    if (isMissingModeActive && !isEmptyNow) return null;
                    
                    return (
                        <div key={key} className={`group flex items-start pl-4 border-l-2 border-transparent hover:bg-white/[0.015] transition-all ${termMatch ? "bg-[#6b5be6]/5" : ""} ${!termMatch && term ? "opacity-30" : "opacity-100"} ${highlightKey === 'json-' + key ? 'highlight-pulse-raw' : ''}`}>
                            <div className="shrink-0 flex items-center pr-2">
                                 <span className="text-white/30 mr-1">&quot;</span>
                                 <span className="text-[#a78bfa] font-black drop-shadow-[0_0_8px_rgba(167,139,250,0.3)]">{key}</span>
                                 <span className="text-white/30 ml-1">&quot;</span>
                                 <span className="text-white/40 ml-2">:</span>
                            </div>
                            <div className={`flex-1 relative flex items-start flex-wrap transition-colors border ${isEmptyNow ? "bg-amber-500/10 border-amber-500/30 rounded-md" : "border-transparent"}`}>
                                <span className={`text-white/20 ml-2 mr-0.5 mt-[2px] shrink-0 select-none ${isEmptyNow ? "text-amber-500/50" : ""}`}>&quot;</span>
                                <textarea
                                    ref={el => { inputRefs.current[i] = el; }}
                                    value={String(val)}
                                    rows={1}
                                    spellCheck={false}
                                    onChange={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                        handleChange(key, e.target.value);
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            if (inputRefs.current[i + 1]) inputRefs.current[i + 1]?.focus();
                                            else e.currentTarget.blur();
                                        }
                                        if (e.key === "ArrowDown") { e.preventDefault(); inputRefs.current[i + 1]?.focus(); }
                                        if (e.key === "ArrowUp") { e.preventDefault(); inputRefs.current[i - 1]?.focus(); }
                                        if (e.key === "Escape") { e.stopPropagation(); e.currentTarget.blur(); }
                                    }}
                                    className={`bg-transparent overflow-hidden resize-none outline-none caret-white transition-colors py-0 mt-0.5 min-h-[1.5em] w-auto inline-block min-w-[20px] whitespace-nowrap ${isEmptyNow ? "text-amber-300/90 font-medium" : "text-[#34d399] font-medium focus:text-white"}`}
                                    placeholder="..."
                                    style={{ width: `${Math.max(2, String(val).length)}ch`, minWidth: '1ch' }}
                                />
                                <span className={`text-white/30 ml-0.5 mr-1 mt-[2px] shrink-0 select-none ${isEmptyNow ? "text-amber-500/50" : ""}`}>&quot;</span>
                                {i < Object.keys(localData).length - 1 && <span className="text-white/20 mt-[2px]">,</span>}
                            </div>
                        </div>
                    );
                }

                // 2. Handle Regular Translations, SEO, and Page Titles
                let originalValue = originalTranslations[key];
                if (key.startsWith("seo.")) originalValue = origSeoMeta[key.replace("seo.", "")];
                else if (key.startsWith("page.")) originalValue = origPageTitles[key];
                
                const wasOriginallyEmpty = !originalValue || String(originalValue).trim() === "";
                
                // If showing missing only, hide if it WAS NOT empty initially
                if (showMissingOnly && !wasOriginallyEmpty) return null;

                const isMatch = termMatch || (showMissingOnly && wasOriginallyEmpty);

                return (
                    <div key={key} className={`group flex items-start pl-4 border-l-2 border-transparent hover:bg-white/[0.015] transition-all ${isMatch ? "bg-[#6b5be6]/5" : ""} ${!isMatch && term ? "opacity-30" : "opacity-100"} ${highlightKey === 'json-' + key ? 'highlight-pulse-raw' : ''}`}>
                        <div className="shrink-0 flex items-center pr-2">
                             <span className="text-white/30 mr-1">&quot;</span>
                             <span className="text-[#a78bfa] font-black drop-shadow-[0_0_8px_rgba(167,139,250,0.3)]">{key}</span>
                             <span className="text-white/30 ml-1">&quot;</span>
                             <span className="text-white/40 ml-2">:</span>
                        </div>
                        <div className={`flex-1 relative flex items-start flex-wrap transition-colors border ${isEmptyNow ? "bg-amber-500/10 border-amber-500/30 rounded-md" : "border-transparent"}`}>
                            <span className={`text-white/20 ml-2 mr-0.5 mt-[2px] shrink-0 select-none ${isEmptyNow ? "text-amber-500/50" : ""}`}>&quot;</span>
                            <textarea
                                ref={el => { inputRefs.current[i] = el; }}
                                value={String(val)}
                                rows={1}
                                spellCheck={false}
                                onChange={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                    handleChange(key, e.target.value);
                                }}
                                onFocus={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        if (inputRefs.current[i + 1]) {
                                            inputRefs.current[i + 1]?.focus();
                                        } else {
                                            e.currentTarget.blur();
                                        }
                                    }
                                    if (e.key === "ArrowDown") {
                                        e.preventDefault();
                                        inputRefs.current[i + 1]?.focus();
                                    }
                                    if (e.key === "ArrowUp") {
                                        e.preventDefault();
                                        inputRefs.current[i - 1]?.focus();
                                    }
                                    if (e.key === "Escape") {
                                        e.stopPropagation();
                                        e.currentTarget.blur();
                                    }
                                }}
                                className={`bg-transparent overflow-hidden resize-none outline-none caret-white transition-colors py-0 mt-0.5 min-h-[1.5em] w-auto inline-block min-w-[20px] whitespace-nowrap ${isEmptyNow ? "text-amber-100/90" : "text-[#34d399] focus:text-white"}`}
                                placeholder="..."
                                style={{ width: `${Math.max(2, String(val).length)}ch`, minWidth: '1ch' }}
                            />
                            <span className={`text-white/40 ml-0.5 mr-1 mt-[2px] shrink-0 select-none ${isEmptyNow ? "text-amber-500/50" : ""}`}>&quot;</span>
                            {i < Object.keys(localData).length - 1 && <span className="text-white/40 mt-[2px]">,</span>}
                        </div>
                    </div>
                );
            })}
            


            <div className="text-white/30">{'}'}</div>
        </div>
    );
});
SmartJsonEditor.displayName = "SmartJsonEditor";

/* ── Memoized Translation Row ── */
const TranslationRow = memo(({ k, defText, trText, isMissingInDb, onUpdate, forwardRef }: { k: string; defText: string; trText: string; isMissingInDb: boolean; onUpdate: (key: string, val: string) => void; forwardRef?: React.Ref<HTMLInputElement | HTMLTextAreaElement>; }) => {
    const isTextarea = defText?.length > 80 || defText?.includes("\n");
    const isEmpty = trText === "";
    return (
        <div className={`grid grid-cols-1 lg:grid-cols-2 lg:gap-4 border-b border-white/[0.04] group transition-all duration-200 ${isEmpty ? "bg-amber-500/[0.015]" : "hover:bg-white/[0.008]"}`}>
            <div className="p-6 break-words text-[13px] text-white/50 font-medium leading-relaxed min-w-0 border-r border-white/[0.04] select-none">
                <div className="text-[10px] font-mono text-[#6b5be6]/80 mb-2 uppercase tracking-[0.18em] group-hover:text-[#6b5be6] transition-colors duration-300">{k}</div>
                {defText}
            </div>
            <div className={`p-6 flex items-start min-w-0 relative ${isEmpty ? "bg-amber-500/[0.01]" : "bg-transparent"}`}>
                {isTextarea ? (
                    <textarea ref={forwardRef as React.Ref<HTMLTextAreaElement>} value={trText} spellCheck={false} onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })} onChange={e => onUpdate(k, e.target.value)} placeholder="..." rows={3} className={`${neonInput} p-4 resize-none min-h-[60px] custom-scrollbar text-[14px] font-medium leading-6`} />
                ) : (
                    <input ref={forwardRef as React.Ref<HTMLInputElement>} type="text" value={trText} spellCheck={false} onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })} onChange={e => onUpdate(k, e.target.value)} placeholder="..." className={`${neonInput} px-5 py-3.5 font-medium text-[14px] leading-6`} />
                )}
                {isEmpty && <div className="absolute top-3 right-4 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.7)]" />}
            </div>
        </div>
    );
}, (prev, next) => prev.k === next.k && prev.trText === next.trText && prev.defText === next.defText && prev.onUpdate === next.onUpdate);
TranslationRow.displayName = "TranslationRow";

/* ── Collapsible Sidebar Section ── */
const SidebarSection = ({ title, icon, children, isOpen, onToggle, isWarning = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; isOpen: boolean; onToggle: () => void; isWarning?: boolean }) => {
    return (
        <div className={`border rounded-2xl overflow-hidden transition-all duration-500 backdrop-blur-md ${isWarning ? "bg-amber-500/[0.02] border-amber-500/15 shadow-[0_4px_30px_rgba(245,158,11,0.04)]" : "bg-white/[0.02] border-white/[0.05] shadow-[0_4px_30px_rgba(0,0,0,0.15)]"}`}>
            <button onClick={onToggle} className="w-full flex items-center justify-between p-4 group/acc hover:bg-white/[0.02] transition-all duration-300">
                <div className="flex items-center gap-2.5">
                    <span className={`transition-colors duration-300 ${isWarning ? "text-amber-400 group-hover/acc:text-amber-300" : "text-[#6b5be6]/60 group-hover/acc:text-[#6b5be6]"}`}>{icon}</span>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${isWarning ? "text-amber-400/90 group-hover/acc:text-amber-300" : "text-white/50 group-hover/acc:text-white/80"}`}>{title}</span>
                </div>
                <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.25, ease: "easeOut" }}>
                    <ChevronDown size={12} className="text-white/20 group-hover/acc:text-white/40 transition-colors duration-300" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0 }} 
                        animate={{ height: "auto" }} 
                        exit={{ height: 0 }} 
                        transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }} 
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-4 border-t border-white/[0.03] select-none">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
SidebarSection.displayName = "SidebarSection";

/* ── Ripple Toggle (Maintenance Style) ── */
const RippleToggle = ({ active, disabled, onToggle }: { active: boolean; disabled?: boolean; onToggle: () => void }) => {
    return (
        <button 
            type="button" 
            disabled={disabled} 
            onClick={onToggle} 
            className={`relative w-9 h-[20px] rounded-full transition-all duration-300 ${disabled ? "bg-white/10 opacity-40 cursor-not-allowed" : active ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-white/10"} cursor-pointer hover:scale-105 active:scale-95`}
        >
            <span className={`absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-300 ${active ? "left-[19px]" : "left-[3px]"}`} />
        </button>
    );
};



/* ── Helper: Saf JSON Builder Çıktısı (Phase 6) ── */
export const constructVirtualJson = (ui: any, seo: any, pt: any, lang: Language | null, searchStr: string, hideFilled: boolean, defaultTrans: Record<string, string>) => {
    if (!lang) return "";
    const out: any = {};
    const term = (searchStr || "").toLowerCase();

    // 1. UI Translations
    Object.keys(defaultTrans).forEach(k => { 
        if (!k.startsWith("page.")) {
            if (hideFilled && ui[k]) return;
            const val = ui[k] || "";
            if (term && !k.toLowerCase().includes(term) && !val.toLowerCase().includes(term)) return;
            out[k] = val; 
        }
    });
    
    // 2. SEO Meta
    const seoKeys = ["title", "description", "keywords", "ogTitle", "ogDesc", "twitterCard"];
    seoKeys.forEach(sk => {
        const v = seo[sk] || "";
        if (hideFilled && v) return;
        if (term && !`seo.${sk}`.toLowerCase().includes(term) && !v.toLowerCase().includes(term)) return;
        out[`seo.${sk}`] = v;
    });

    // 3. Page Titles
    Object.keys(pt).forEach(k => {
        const v = pt[k] || "";
        if (hideFilled && v) return;
        if (term && !k.toLowerCase().includes(term) && !v.toLowerCase().includes(term)) return;
        out[k] = v;
    });

    // 4. Config -- flattened for direct editing
    out["_config.name"] = lang.name;
    out["_config.code"] = lang.code;
    out["_config.utcOffset"] = lang.utcOffset;
    out["_config.localName"] = lang.nativeName;
    out["_config.trName"] = lang.turkishName;
    out["_config.svg"] = lang.flagSvg;
    out["_config.isActive"] = lang.isActive;
    
    return JSON.stringify(out, null, 4);
};

/* ── Main Page ── */
export default function LanguageTranslationPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const router = useRouter();
    const { showToast } = useOptWinStore();
    const unsavedCtx = useUnsavedChanges();

    const [language, setLanguage] = useState<Language | null>(null);
    const [originalLanguage, setOriginalLanguage] = useState<Language | null>(null);
    const [defaultLang, setDefaultLang] = useState<Language | null>(null);
    const [defaultTrans, setDefaultTrans] = useState<Record<string, string>>({});
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [originalTranslations, setOriginalTranslations] = useState<Record<string, string>>({});
    const [seoMetadata, setSeoMetadata] = useState<any>({});
    const [origSeoMeta, setOrigSeoMeta] = useState<any>({});
    const [pageTitles, setPageTitles] = useState<Record<string, string>>({});
    const [origPageTitles, setOrigPageTitles] = useState<Record<string, string>>({});

    const [searchQuery, setSearchQuery] = useState("");
    const deferredSearch = useDeferredValue(searchQuery);
    const [showMissingOnly, setShowMissingOnly] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isJsonMode, setIsJsonMode] = useState(false);
    const [jsonContent, setJsonContent] = useState("");
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [showDefaultModal, setShowDefaultModal] = useState(false);
    const [pendingCode, setPendingCode] = useState<string | null>(null);
    const [highlightKey, setHighlightKey] = useState<string | null>(null);
    const [targetLoadIndex, setTargetLoadIndex] = useState<number | null>(null);
    const [uiKey, setUiKey] = useState(0);
    const isDirty = useMemo(() => {
        try {
            return JSON.stringify(translations) !== JSON.stringify(originalTranslations) ||
                   JSON.stringify(pageTitles) !== JSON.stringify(origPageTitles) ||
                   JSON.stringify(seoMetadata) !== JSON.stringify(origSeoMeta) ||
                   JSON.stringify(language) !== JSON.stringify(originalLanguage);
        } catch { return false; }
    }, [translations, originalTranslations, pageTitles, origPageTitles, seoMetadata, origSeoMeta, language, originalLanguage]);
    // Keep setIsDirty as a mock function to satisfy existing handlers safely
    const setIsDirty = useCallback((dirty: boolean) => {}, []);
    // Snapshot refs: frozen copies taken when entering JSON mode
    const snapshotTr = useRef<Record<string, string>>({});
    const snapshotSeo = useRef<any>({});
    const snapshotPt = useRef<Record<string, string>>({});
    const snapshotLang = useRef<Language | null>(null);
    const snapshotJson = useRef<string>("");
    const [statusOpen, setStatusOpen] = useState(true);
    const [seoOpen, setSeoOpen] = useState(false);
    const [ptOpen, setPtOpen] = useState(false);
    const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
    const jsonContainerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const seoRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const pageTitleRefs = useRef<Record<string, HTMLInputElement | null>>({});

    // Extra data for comprehensive progress (features, categories, script labels)
    type FeatureData = { translations: { lang: string; title: string; desc: string }[]; commands: { lang: string; scriptMessage: string }[] };
    type CategoryData = { translations: { lang: string; name: string }[] };
    const [extraFeatures, setExtraFeatures] = useState<FeatureData[]>([]);
    const [extraCategories, setExtraCategories] = useState<CategoryData[]>([]);
    const [extraScriptLabels, setExtraScriptLabels] = useState<Record<string, Record<string, string>>>({});
    const [extraEnLabelKeys, setExtraEnLabelKeys] = useState<string[]>([]);

    /* ── Data Fetch ── */
    useEffect(() => {
        const init = async () => {
            try {
                const resLangs = await fetch("/api/admin/languages");
                const langsData = await resLangs.json();
                if (Array.isArray(langsData)) {
                    const langs: Language[] = langsData;
                    const curr = langs.find((l) => l.code === code);
                    const def = langs.find((l) => l.isDefault) || langs[0];
                    if (curr) {
                        setLanguage(curr);
                        setOriginalLanguage(structuredClone(curr));
                        const seo = (curr as any).seoMetadata || {};
                        setSeoMetadata(seo);
                        setOrigSeoMeta(structuredClone(seo));
                    }
                    if (def) setDefaultLang(def);
                    const [resCurr, resDef] = await Promise.all([
                        fetch(`/api/admin/languages/translations?code=${code}`),
                        fetch(`/api/admin/languages/translations?code=${def.code}`)
                    ]);
                    const filterMeta = (obj: any) => {
                        const next = { ...obj };
                        delete next["seo.title"]; delete next["seo.description"]; delete next["seo.keywords"];
                        return next;
                    };
                    const dTrans = (await resDef.json()).translations || {};
                    setDefaultTrans(filterMeta(dTrans));
                    const cTrans = (await resCurr.json()).translations || {};
                    const ui: Record<string, string> = {};
                    const pt: Record<string, string> = {};
                    Object.keys(cTrans).forEach(k => {
                        if (k.startsWith("page.")) pt[k] = cTrans[k];
                        else ui[k] = cTrans[k];
                    });
                    setTranslations(ui);
                    setOriginalTranslations(structuredClone(ui));
                    setPageTitles(pt);
                    setOrigPageTitles(structuredClone(pt));
                }
            } catch {
                setError("Veriler yüklenirken hata oluştu.");
            } finally {
                setLoading(false);
            }
        };
        const initExtra = async () => {
            try {
                const [fRes, cRes, lRes] = await Promise.all([
                    fetch("/api/admin/features"),
                    fetch("/api/admin/categories"),
                    fetch("/api/admin/script-labels"),
                ]);
                const fData = await fRes.json();
                const cData = await cRes.json();
                const lData = await lRes.json();
                if (fData.success) setExtraFeatures(fData.features || []);
                if (cData.success) setExtraCategories(cData.categories || []);
                if (lData.success) {
                    setExtraScriptLabels(lData.labels || {});
                    setExtraEnLabelKeys(Object.keys(lData.labels?.en || {}));
                }
            } catch { /* ignore */ }
        };
        init();
        initExtra();
    }, [code]);


    const deconstructVirtualJson = useCallback((jsonStr: string) => {
        try {
            const parsed = JSON.parse(jsonStr);
            const ui: any = {}; const seoPartial: any = {}; const ptPartial: any = {}; const meta: any = {};
            
            Object.keys(parsed).forEach(k => {
                if (k.startsWith("_config.")) { meta[k.replace("_config.", "")] = parsed[k]; }
                else if (k.startsWith("seo.")) { seoPartial[k.replace("seo.", "")] = parsed[k] || ""; }
                else if (k.startsWith("page.")) { ptPartial[k] = parsed[k] || ""; }
                else { ui[k] = parsed[k] || ""; }
            });
            
            // Critical: Ensure full object structure to match original state types
            setTranslations(prev => {
                const next = { ...prev };
                Object.keys(ui).forEach(k => { next[k] = ui[k]; });
                return next;
            });
            
            if (Object.keys(seoPartial).length > 0) {
                setSeoMetadata((prev: any) => ({ ...prev, ...seoPartial }));
            }
            
            if (Object.keys(ptPartial).length > 0) {
                setPageTitles((prev: any) => ({ ...prev, ...ptPartial }));
            }

            if (Object.keys(meta).length > 0) {
                setLanguage(prev => {
                    if (!prev) return null;
                    return { 
                        ...prev, 
                        name: (meta.name || prev.name).trim(),
                        nativeName: meta.localName || prev.nativeName, 
                        turkishName: meta.trName || prev.turkishName, 
                        flagSvg: meta.svg || prev.flagSvg, 
                        utcOffset: meta.utcOffset !== undefined ? Number(meta.utcOffset) : prev.utcOffset, 
                        isActive: meta.isActive !== undefined ? String(meta.isActive) === "true" : prev.isActive, 
                        sortOrder: meta.order !== undefined ? Number(meta.order) : prev.sortOrder 
                    };
                });
            }
        } catch (e) {
            console.warn("JSON Sync Parse Error");
        }
    }, [setTranslations, setSeoMetadata, setPageTitles, setLanguage]);

    const patchJsonContent = useCallback((updates: Record<string, any>) => {
        if (!isJsonMode) return;
        setJsonContent(prev => {
            try {
                const parsed = JSON.parse(prev);
                let changed = false;
                for (const [k, v] of Object.entries(updates)) {
                    if (parsed[k] !== v) {
                        parsed[k] = v;
                        changed = true;
                    }
                }
                return changed ? JSON.stringify(parsed, null, 4) : prev;
            } catch { return prev; }
        });
    }, [isJsonMode]);

    const toggleJsonMode = (revert = false) => {
        if (!isJsonMode) {
             // Take a snapshot of current state BEFORE entering JSON mode
             snapshotTr.current = structuredClone(translations);
             snapshotSeo.current = structuredClone(seoMetadata);
             snapshotPt.current = structuredClone(pageTitles);
             snapshotLang.current = language ? structuredClone(language) : null;
             
             const initialJson = constructVirtualJson(translations, seoMetadata, pageTitles, language, deferredSearch, showMissingOnly, defaultTrans);
             snapshotJson.current = initialJson;
             setJsonContent(initialJson);
             setIsJsonMode(true);
        } else {
             if (revert) {
                // Restore from snapshot -- discard all JSON edits
                setTranslations(snapshotTr.current);
                setSeoMetadata(snapshotSeo.current);
                setPageTitles(snapshotPt.current);
                if (snapshotLang.current) setLanguage(snapshotLang.current);
                setIsDirty(false);
                showToast("Değişiklikler geri alındı.", "success");
             } else {
                // Apply JSON edits to UI state
                deconstructVirtualJson(jsonContent);
             }
             
             // Increment key to force React to fully re-mount the UI tree
             setTimeout(() => {
                setUiKey(prev => prev + 1);
                setIsJsonMode(false);
             }, 10);
        }
    };

    const handleJsonRevert = useCallback(() => {
        if (jsonContent !== snapshotJson.current) {
            setJsonContent(snapshotJson.current);
            // Restore UI states from entry snapshots to allow action bar to reflect accurate status
            setTranslations(snapshotTr.current);
            setSeoMetadata(snapshotSeo.current);
            setPageTitles(snapshotPt.current);
            if (snapshotLang.current) setLanguage(snapshotLang.current);
            
            // Discard the dirty flag for this session to hide the action bar
            setIsDirty(false);
            showToast("JSON değişiklikleri geri alındı.", "warning");
        }
    }, [jsonContent, showToast]);

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const imported = JSON.parse(ev.target?.result as string);
                setJsonContent(JSON.stringify(imported, null, 4));
                deconstructVirtualJson(JSON.stringify(imported));
                setIsDirty(true);
                showToast("İçe aktarma başarılı.", "success");
            } catch { showToast("Hatalı JSON.", "error"); }
        };
        reader.readAsText(file);
    };

    /* ── Change Detection ── */
    const hasChanges = isDirty || pendingCode !== null;

    useEffect(() => {
        unsavedCtx.setHasUnsavedChanges(hasChanges);
        return () => unsavedCtx.setHasUnsavedChanges(false);
    }, [hasChanges, unsavedCtx]);

    /* ── Save ── */
    const handleSave = useCallback(async () => {
        if (!hasChanges) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/languages/translations", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code, translations: { ...translations, ...pageTitles } })
            });
            if (res.ok) {
                if (language) {
                    await fetch("/api/admin/languages", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...language, id: language.id, newCode: pendingCode, seoMetadata: seoMetadata })
                    });
                }
                setOriginalTranslations(structuredClone(translations));
                setOrigPageTitles(structuredClone(pageTitles));
                setOrigSeoMeta(structuredClone(seoMetadata));
                if (language) setOriginalLanguage(structuredClone(language));
                setSaved(true);
                setIsDirty(false);
                showToast("Değişiklikler kaydedildi.", "success");
                window.dispatchEvent(new CustomEvent("optwin:languages-updated"));
                setTimeout(() => setSaved(false), 2000);
                if (pendingCode) {
                    history.pushState(null, "", `/admin/languages/${pendingCode}`);
                    setPendingCode(null);
                }
            }
        } catch {
            showToast("Kaydetme hatası.", "error");
        } finally {
            setSaving(false);
        }
    }, [hasChanges, code, translations, pageTitles, language, pendingCode, seoMetadata, showToast, router]);

    /* ── Cancel ── */
    const handleCancel = () => {
        const tr = structuredClone(originalTranslations);
        const pt = structuredClone(origPageTitles);
        const seo = structuredClone(origSeoMeta);
        const lang = originalLanguage ? structuredClone(originalLanguage) : null;

        setTranslations(tr);
        setPageTitles(pt);
        setSeoMetadata(seo);
        if (lang) setLanguage(lang);
        setPendingCode(null);

        // Crucial: Update jsonContent to reflect the original state if in JSON mode
        const restoredJson = constructVirtualJson(tr, seo, pt, lang, "", false, defaultTrans);
        setJsonContent(restoredJson);
        snapshotJson.current = restoredJson;

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        setIsDirty(false);
        showToast("Değişiklikler geri alındı.", "success");
    };

    /* ── Default Language ── */
    const handleMakeDefault = async () => {
        if (!language) return;
        try {
            const res = await fetch("/api/admin/languages", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...language, isDefault: true })
            });
            if (res.ok) {
                setLanguage({ ...language, isDefault: true });
                if (originalLanguage) setOriginalLanguage({ ...originalLanguage, isDefault: true });
                setShowDefaultModal(false);
                showToast("Varsayılan dil güncellendi.", "success");
                window.dispatchEvent(new CustomEvent("optwin:languages-updated"));
            } else { showToast("Varsayılan dil güncellenemedi.", "error"); }
        } catch { showToast("Ağ hatası.", "error"); }
    };

    /* ── Stable Callbacks (Phase 3) ── */
    const handleTranslationUpdate = useCallback((k: string, v: string) => {
        setTranslations(prev => ({ ...prev, [k]: v }));
        setIsDirty(true);
    }, []);

    const handleJsonUpdate = useCallback((key: string, val: string) => {
        setIsDirty(true);
        setJsonContent(prev => {
            try {
                const parsed = JSON.parse(prev);
                parsed[key] = val;
                return JSON.stringify(parsed, null, 4);
            } catch { return prev; }
        });
    }, []);

    /* ── AI Translation (MyMemory - Ücretsiz) ── */
    const handleAITranslate = async () => {
        const missingKeys = Object.keys(defaultTrans).filter(k => !translations[k]);
        if (missingKeys.length === 0 || !language || !defaultLang) return;
        setIsTranslating(true);
        try {
            const res = await fetch("/api/admin/languages/ai-translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetLang: language.code,
                    sourceLang: defaultLang.code,
                    translations: Object.fromEntries(missingKeys.map(k => [k, defaultTrans[k]]))
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setTranslations(prev => ({ ...prev, ...data.translations }));
                setIsDirty(true);
                showToast("Eksikler tamamlandı.", "success");
            } else {
                showToast(data.error || "Çeviri sırasında bir hata oluştu.", "error");
            }
        } catch {
            showToast("Ağ hatası veya sunucuya ulaşılamıyor.", "error");
        } finally {
            setIsTranslating(false);
        }
    };

    /* ── Computed ── */
    const allKeys = useMemo(() => Object.keys(defaultTrans).filter(k => !k.startsWith("page.")), [defaultTrans]);
    const filteredKeys = useMemo(() => allKeys.filter(k => {
        const isMatch = (!showMissingOnly || !originalTranslations[k] || originalTranslations[k].trim() === "");
        const searchMatch = (!deferredSearch || k.toLowerCase().includes(deferredSearch.toLowerCase()));
        return isMatch && searchMatch;
    }), [allKeys, showMissingOnly, deferredSearch, originalTranslations]);
    
    // Use originalTranslations for counters so they don't jump while typing
    const missingCount = useMemo(() => {
        let count = 0;
        allKeys.forEach(k => {
            if (!originalTranslations[k] || originalTranslations[k].trim() === "") count++;
        });
        return count;
    }, [allKeys, originalTranslations]);

    // Task: Automatically exit 'Show Missing' mode when all are resolved (on save)
    useEffect(() => {
        if (showMissingOnly && missingCount === 0) {
            setShowMissingOnly(false);
        }
    }, [missingCount, showMissingOnly]);

    // Compute extra data for this language
    const extraData = useMemo((): ExtraProgressData => {
        const defCode = defaultLang?.code || "en";
        if (code === defCode) {
            const t = extraFeatures.length * 3;
            const c = extraCategories.length;
            return { totalFeatures: t, filledFeatures: t, totalScriptLabels: extraEnLabelKeys.length, filledScriptLabels: extraEnLabelKeys.length, totalCategories: c, filledCategories: c };
        }
        let totalF = 0, filledF = 0;
        for (const f of extraFeatures) {
            const enTr = f.translations.find(t => t.lang === "en");
            if (!enTr?.title) continue;
            totalF++;
            const tr = f.translations.find(t => t.lang === code);
            if (tr?.title?.trim()) filledF++;
            if (enTr.desc?.trim()) { totalF++; if (tr?.desc?.trim()) filledF++; }
            const enCmd = f.commands.find(c => c.lang === "en");
            if (enCmd?.scriptMessage?.trim()) { totalF++; const cmd = f.commands.find(c => c.lang === code); if (cmd?.scriptMessage?.trim()) filledF++; }
        }
        const filledLabels = extraEnLabelKeys.filter(k => { const v = extraScriptLabels[code]?.[k]; return v && v.trim() !== ""; }).length;
        let totalC = 0, filledC = 0;
        for (const cat of extraCategories) {
            const enN = cat.translations.find(t => t.lang === "en")?.name;
            if (!enN) continue;
            totalC++;
            const tr = cat.translations.find(t => t.lang === code);
            if (tr?.name?.trim()) filledC++;
        }
        return { totalFeatures: totalF, filledFeatures: filledF, totalScriptLabels: extraEnLabelKeys.length, filledScriptLabels: filledLabels, totalCategories: totalC, filledCategories: filledC };
    }, [code, defaultLang, extraFeatures, extraCategories, extraScriptLabels, extraEnLabelKeys]);

    const { percentage, breakdown } = useMemo(() => calculateProgress({ ...translations, ...pageTitles }, seoMetadata, allKeys, extraData), [translations, pageTitles, seoMetadata, allKeys, extraData]);
    
    // Global minimap markers (works for both UI and JSON modes)
    const minimapMarkers = useMemo(() => {
        const markers: number[] = [];
        if (isJsonMode) {
            const lines = jsonContent.split("\n");
            const total = lines.length;
            if (total === 0) return markers;
            lines.forEach((l, i) => {
                const isMissing = l.includes(': ""') || l.endsWith(': "",');
                // Maps closer to the actual line position in the viewport
                if (isMissing) markers.push(((i) / total) * 100);
            });
            return markers;
        }

        const totalKeys = filteredKeys.length;
        if (totalKeys === 0) return markers;

        let totalEstY = 0;
        const positions = filteredKeys.map(k => {
            const defText = defaultTrans[k] || "";
            const isTextarea = defText.length > 80 || defText.includes("\n");
            // 103px is exact Grid Row height for standard inputs; 153px for 3-row textareas
            const h = isTextarea ? 153 : 103; 
            const y = totalEstY;
            totalEstY += h;
            return { k, center: y + (h / 2) };
        });

        positions.forEach((pos) => {
            const isMissing = !originalTranslations[pos.k] || originalTranslations[pos.k].trim() === "";
            // Maps to the physical height proportion exactly honoring varying item sizes
            if (isMissing) markers.push((pos.center / totalEstY) * 100);
        });
        return markers;
    }, [filteredKeys, originalTranslations, isJsonMode, jsonContent, defaultTrans]);

    const parentRef = useRef<HTMLDivElement>(null);
    const virtualizer = useVirtualizer({
        count: filteredKeys.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => {
            const k = filteredKeys[index];
            if (!k) return 103;
            const defText = defaultTrans[k] || "";
            return (defText.length > 80 || defText.includes("\n")) ? 153 : 103;
        },
        overscan: 25,
        measureElement: el => el?.getBoundingClientRect().height ?? 103,
        rangeExtractor: useCallback((range: any) => {
            const active = new Set<number>();
            const start = Math.max(0, range.startIndex - 25);
            const end = Math.min(filteredKeys.length - 1, range.endIndex + 25);

            for (let i = start; i <= end; i++) active.add(i);

            if (targetLoadIndex !== null) {
                // Connect the gap so it can naturally scroll through rendered elements without mounting
                const min = Math.min(start, targetLoadIndex);
                const max = Math.max(end, targetLoadIndex + 5);
                
                // If the gap is manageable, render everything in between to ensure 60fps tweens
                if (max - min < 150) {
                    for (let i = min; i <= max; i++) active.add(i);
                } else {
                    for (let i = Math.max(0, targetLoadIndex - 20); i <= Math.min(filteredKeys.length - 1, targetLoadIndex + 20); i++) active.add(i);
                }
            }
            return Array.from(active).sort((a, b) => a - b);
        }, [filteredKeys.length, targetLoadIndex]),
        scrollToFn: (offset, canSmooth, instance) => {
            const el = parentRef.current;
            if (!el) return;
            if (canSmooth) {
                const start = el.scrollTop;
                const change = offset - start;
                const startTime = performance.now();
                const duration = 800;
                let isCanceled = false;
                const cancel = () => { isCanceled = true; };
                el.addEventListener('wheel', cancel, { passive: true, once: true });
                el.addEventListener('touchstart', cancel, { passive: true, once: true });
                el.addEventListener('mousedown', cancel, { passive: true, once: true });

                function animateScroll(currentTime: number) {
                    if (!el || isCanceled) {
                        el?.removeEventListener('wheel', cancel);
                        el?.removeEventListener('touchstart', cancel);
                        el?.removeEventListener('mousedown', cancel);
                        return;
                    }
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                    el.scrollTop = start + change * easeOutCubic;
                    
                    if (progress < 1) {
                        requestAnimationFrame(animateScroll);
                    } else {
                        el.removeEventListener('wheel', cancel);
                        el.removeEventListener('touchstart', cancel);
                        el.removeEventListener('mousedown', cancel);
                    }
                }
                requestAnimationFrame(animateScroll);
            } else {
                el.scrollTop = offset;
            }
        }
    });

    /* ── Task 2: Smart Jump with Highlight Pulse ── */
    const jumpToNextMissing = useCallback(() => {
        if (isJsonMode) {
            const lines = jsonContent.split("\n");
            // Highlight lines that are empty
            const targetLine = lines.findIndex(l => l.includes(': ""') || l.endsWith(': "",'));
            if (targetLine !== -1) {
                const el = jsonContainerRef.current;
                if (!el) return;

                const parsed = JSON.parse(jsonContent || "{}");
                const keys = Object.keys(parsed);
                const emptyKey = keys.find(k => !parsed[k] || String(parsed[k]).trim() === "");
                const rowHeight = 28; // approximate line height in virtual json editor
                
                const targetTop = Math.max(0, targetLine * rowHeight - el.clientHeight / 2 + 100);
                const start = el.scrollTop;
                const change = targetTop - start;
                const startTime = performance.now();
                const duration = 800;
                let isCanceled = false;
                const cancel = () => { isCanceled = true; };
                el.addEventListener('wheel', cancel, { passive: true, once: true });
                el.addEventListener('touchstart', cancel, { passive: true, once: true });
                el.addEventListener('mousedown', cancel, { passive: true, once: true });

                function animateScroll(currentTime: number) {
                    if (!el || isCanceled) {
                        el?.removeEventListener('wheel', cancel);
                        el?.removeEventListener('touchstart', cancel);
                        el?.removeEventListener('mousedown', cancel);
                        return;
                    }
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                    el.scrollTop = start + change * easeOutCubic;
                    
                    if (progress < 1) {
                        requestAnimationFrame(animateScroll);
                    } else {
                        el.removeEventListener('wheel', cancel);
                        el.removeEventListener('touchstart', cancel);
                        el.removeEventListener('mousedown', cancel);
                    }
                }
                requestAnimationFrame(animateScroll);
                
                if (emptyKey) {
                    setTimeout(() => {
                        setHighlightKey(`json-${emptyKey}`);
                        setTimeout(() => setHighlightKey(null), 1500);
                    }, 850);
                }
                showToast(`Satır ${targetLine + 1} üzerinde eksik değer bulundu.`, "success");
                return;
            }
        }

        // 1. Check current filtered list (translations)
        const currentOffset = virtualizer.scrollOffset || 0;
        const currentIndex = Math.floor(currentOffset / 82);
        
        // Find all missing indices
        const missingIndices = filteredKeys
            .map((k, i) => (!originalTranslations[k] || originalTranslations[k].trim() === "") ? i : -1)
            .filter(idx => idx !== -1);

        if (missingIndices.length > 0) {
            // Find the first missing index that is AFTER our current view
            let nextTrIndex = missingIndices.find(idx => idx > currentIndex + 1);
            
            // If none found after, loop back to the first missing one (from the top)
            if (nextTrIndex === undefined) nextTrIndex = missingIndices[0];

            const nextTr = filteredKeys[nextTrIndex];
            setTargetLoadIndex(nextTrIndex);

            setTimeout(() => {
                virtualizer.scrollToIndex(nextTrIndex, { align: "center", behavior: "smooth" });
                
                setTimeout(() => {
                    setTargetLoadIndex(null);
                    setHighlightKey(nextTr);
                    inputRefs.current[nextTr]?.focus();
                    setTimeout(() => setHighlightKey(null), 1500);
                }, 850);
            }, 60);
            return;
        }

        // 2. Check ALL translations (might be hidden by search)
        const globalNextKey = allKeys.find(k => !originalTranslations[k] || originalTranslations[k].trim() === "");
        if (globalNextKey) {
            setSearchQuery("");
            setShowMissingOnly(true);
            showToast("Arama temizlendi ve eksiklere odaklanıldı.", "success");
            // Recursive call after state update would be complex, just trigger once more
            return;
        }

        // 3. Check SEO fields
        const nextSeo = SEO_KEYS.find(f => !seoMetadata[f]);
        if (nextSeo) {
            setSeoOpen(true);
            setTimeout(() => {
                seoRefs.current[nextSeo]?.focus();
                seoRefs.current[nextSeo]?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 350);
            setTimeout(() => {
                setHighlightKey(`seo.${nextSeo}`);
                setTimeout(() => setHighlightKey(null), 1800);
            }, 850);
            return;
        }

        // 4. Check page titles
        const nextPt = PAGE_KEYS.find(k => !pageTitles[k]);
        if (nextPt) {
            setPtOpen(true);
            setTimeout(() => {
                pageTitleRefs.current[nextPt]?.focus();
                pageTitleRefs.current[nextPt]?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 350);
            setTimeout(() => {
                setHighlightKey(nextPt);
                setTimeout(() => setHighlightKey(null), 1800);
            }, 850);
            return;
        }
        showToast("Tüm alanlar tamamlanmış görünüyor!", "success");
    }, [translations, seoMetadata, pageTitles, isJsonMode, jsonContent, filteredKeys, allKeys, virtualizer, showToast, originalTranslations]);

    /* ── Bi-directional Sync ── */
    useEffect(() => {
        if (isJsonMode) deconstructVirtualJson(jsonContent);
    }, [jsonContent, isJsonMode, deconstructVirtualJson]);

    useEffect(() => {
        // Sync JSON with ALL UI states in real-time
        if (!isJsonMode) {
            const nextJson = constructVirtualJson(translations, seoMetadata, pageTitles, language, deferredSearch, showMissingOnly, defaultTrans);
            setJsonContent(nextJson);
        }
    }, [translations, seoMetadata, pageTitles, language, isJsonMode, deferredSearch, showMissingOnly, defaultTrans]);

    /* ── Task 5: Keyboard Shortcuts ── */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                handleSave();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "f") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [handleSave]);

    if (loading) return <div className="flex items-center justify-center p-20"><Loader /></div>;
    if (!language) return null;

    const progressColor = percentage >= 90 ? "text-[#00f8da]" : percentage >= 50 ? "text-amber-400" : "text-white/40";
    const barGradient = percentage >= 90
        ? "bg-gradient-to-r from-[#04d16d] to-[#00f8da] shadow-[0_0_20px_rgba(0,248,218,0.25)]"
        : "bg-gradient-to-r from-[#5a4cc2] to-[#6b5be6] shadow-[0_0_20px_rgba(107,91,230,0.25)]";

    /* highlight pulse CSS class */
    const pulseClass = "highlight-pulse-ui";

    return (
        <div className="w-full h-[calc(100vh-150px)] max-w-[1920px] mx-auto flex flex-col overflow-hidden">
            <style>{`
                .optwin-pro-scroll::-webkit-scrollbar { width: 16px; height: 16px; }
                .optwin-pro-scroll::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); border-radius: 4px; }
                .optwin-pro-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 8px; transition: all 0.2s; }
                .optwin-pro-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
                .optwin-pro-scroll::-webkit-scrollbar-corner { background: transparent; }

                @keyframes highlightPulseUi {
                    0% { box-shadow: inset 0 0 0 rgba(107, 91, 230, 0); background-color: transparent; }
                    20% { box-shadow: inset 0 0 30px rgba(107, 91, 230, 0.5); background-color: rgba(107, 91, 230, 0.08); }
                    80% { box-shadow: inset 0 0 30px rgba(107, 91, 230, 0.5); background-color: rgba(107, 91, 230, 0.08); }
                    100% { box-shadow: inset 0 0 0 rgba(107, 91, 230, 0); background-color: transparent; }
                }
                .highlight-pulse-ui { animation: highlightPulseUi 1.5s ease-in-out forwards; border-radius: 8px; pointer-events: none; }
                .highlight-pulse-ui > * { pointer-events: auto; }

                @keyframes highlightPulseRaw {
                    0% { background-color: transparent; }
                    20% { background-color: rgba(245, 158, 11, 0.15); border-radius: 4px; box-shadow: inset 0 0 10px rgba(245, 158, 11, 0.2); }
                    80% { background-color: rgba(245, 158, 11, 0.15); border-radius: 4px; box-shadow: inset 0 0 10px rgba(245, 158, 11, 0.2); }
                    100% { background-color: transparent; }
                }
                .highlight-pulse-raw { animation: highlightPulseRaw 1.5s ease-in-out forwards; }
            `}</style>
            <AdminActionBar show={hasChanges} saving={saving} saved={saved} onSave={handleSave} onCancel={handleCancel} error={error || undefined} />

            {/* ── Header ── */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="w-full bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-2xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/admin/languages")} className="p-2.5 bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.06] border border-white/[0.06] rounded-xl transition-all duration-300 text-white/40 hover:text-white hover:shadow-[0_0_15px_rgba(107,91,230,0.1)] hover:border-[#6b5be6]/30 active:scale-95 shrink-0">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <FlagIcon flagSvg={language.flagSvg} size="lg" />
                        <div>
                            <h1 className="text-lg font-black text-white uppercase tracking-tight leading-tight">{language.nativeName}</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-mono text-[#6b5be6] bg-[#6b5be6]/10 px-1.5 py-0.5 rounded uppercase tracking-wider">{language.code}</span>
                                <span className="text-[9px] text-white/20 font-bold uppercase tracking-[0.15em]">UTC {language.utcOffset > 0 ? `+${language.utcOffset}` : language.utcOffset}</span>
                                {language.isActive
                                    ? <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Aktif</span>
                                    : <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Pasif</span>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
                    <button onClick={() => setIsInfoModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-white/[0.04] backdrop-blur-md hover:bg-[#6b5be6]/20 border border-white/[0.1] hover:border-[#6b5be6]/50 hover:shadow-[0_0_25px_rgba(107,91,230,0.2)] text-white/70 hover:text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 shrink-0 cursor-pointer">
                        <Settings2 size={14} /> DÜZENLE
                    </button>
                    <label className="flex items-center gap-2 px-6 py-3 bg-white/[0.04] backdrop-blur-md hover:bg-emerald-500/15 border border-white/[0.1] hover:border-emerald-500/40 text-white/50 hover:text-emerald-400 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer active:scale-95 shrink-0">
                        <FileUp size={14} /><span className="font-black">İÇE AKTAR</span>
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </label>
                    <button onClick={() => {
                        const exportJson = constructVirtualJson(translations, seoMetadata, pageTitles, language, "", false, defaultTrans);
                        const blob = new Blob([exportJson], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url; a.download = `${code}.json`; a.click();
                        URL.revokeObjectURL(url);
                    }} className="flex items-center gap-2 px-6 py-3 bg-white/[0.04] backdrop-blur-md hover:bg-amber-500/15 border border-white/[0.1] hover:border-amber-500/40 text-white/50 hover:text-amber-400 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 shrink-0 cursor-pointer">
                        <FileDown size={14} /><span className="font-black">DIŞA AKTAR</span>
                    </button>
                </div>
            </motion.div>

            {/* ── Main 2-Column Layout ── */}
            <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start pb-4">

                {/* ── Left Column ── */}
                <div className="h-full flex flex-col space-y-5 min-h-0">
                    {/* Search + Mode Toggles + Task 5 shortcut hint */}
                    <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.02] backdrop-blur-md border border-white/[0.05] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                        <div className="relative w-full sm:w-80">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                            <input ref={searchRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Anahtar veya çeviri ara..." className={`${neonInput} pl-10`} />
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => toggleJsonMode()} className={`px-5 py-2.5 border rounded-xl text-[10px] flex items-center gap-2 font-black uppercase tracking-[0.15em] transition-all duration-300 active:scale-95 ${isJsonMode ? "bg-[#064e3b]/40 text-[#34d399] border-[#059669]/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:bg-[#065f46]/60 hover:border-[#34d399]/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]" : "bg-[#140f2d]/50 text-[#b39ddb] border-[#6b5be6]/30 shadow-[0_0_20px_rgba(107,91,230,0.15)] hover:bg-[#1f1747]/80 hover:border-[#6b5be6]/60 hover:text-white hover:shadow-[0_0_25px_rgba(107,91,230,0.3)]"}`}>
                                <Settings2 size={13} className={isJsonMode ? "text-[#34d399]" : "text-[#6b5be6]"} /> {isJsonMode ? "UI MOD" : "RAW JSON"}
                            </button>
                            {missingCount > 0 && (
                                <button onClick={() => setShowMissingOnly(!showMissingOnly)} className={`px-5 py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 active:scale-95 ${showMissingOnly ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]" : "bg-white/[0.02] text-white/50 border-white/[0.06] hover:border-amber-500/40 hover:text-white hover:bg-white/[0.04] hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]"}`}>
                                    EKSİKLER
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Translation Area ── */}
                    <div className="flex-1 min-h-0 bg-white/[0.015] backdrop-blur-md border border-white/[0.05] rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.25)] relative flex flex-col group border-b-0">
                        <AnimatePresence mode="popLayout">
                            {!isJsonMode ? (
                                <motion.div key={`ui-mode-${uiKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex flex-col h-full absolute inset-0">
                                    <div className="grid grid-cols-2 bg-white/[0.02] backdrop-blur-md border-b border-white/[0.05] sticky top-0 z-20">
                                        <div className="p-3.5 px-5 text-[10px] flex items-center gap-2 font-black text-white/30 uppercase tracking-[0.2em]">
                                            <FlagIcon flagSvg={defaultLang?.flagSvg ?? ""} size="sm" /> 
                                            <span className="truncate">{defaultLang?.turkishName || "Referans"} ({defaultLang?.code?.toUpperCase()})</span>
                                        </div>
                                        <div className="p-3.5 px-5 text-[10px] flex items-center justify-between font-black text-[#6b5be6]/60 uppercase tracking-[0.2em] border-l border-white/[0.04]">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <FlagIcon flagSvg={language.flagSvg} size="sm" />
                                                <span className="truncate">{language.turkishName} ({language.nativeName})</span>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0 ml-2">
                                            </div>
                                        </div>
                                    </div>
                                    <div ref={parentRef} className="flex-1 overflow-y-auto optwin-pro-scroll relative" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(107, 91, 230, 0.5) rgba(0, 0, 0, 0.2)' }}>
                                        {filteredKeys.length > 0 ? (
                                            <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
                                                {virtualizer.getVirtualItems().map((vItem) => {
                                                    const k = filteredKeys[vItem.index];
                                                    return (
                                                        <div key={k} data-index={vItem.index} ref={virtualizer.measureElement} style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${vItem.start}px)` }} className={highlightKey === k ? pulseClass : ""}>
                                                            <TranslationRow k={k} defText={defaultTrans[k]} trText={translations[k] || ""} isMissingInDb={!originalTranslations[k]} onUpdate={handleTranslationUpdate} forwardRef={el => { inputRefs.current[k] = el; }} />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-20 text-center space-y-4"><XCircle size={36} className="text-white/8 mx-auto" /><p className="text-white/25 text-[10px] font-black uppercase tracking-[0.2em]">Sonuç bulunamadı</p></div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                /* ── Structural JSON Editor ── */
                                <motion.div key="json-mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex flex-col h-full absolute inset-0 z-10">
                                    <div className="bg-white/[0.02] backdrop-blur-md border-b border-white/[0.05] h-[45px] px-6 flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Raw JSON Editor</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-[#b39ddb] shadow-[0_0_8px_rgba(179,157,219,0.3)]" />
                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Key</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-[#a5d6a7] shadow-[0_0_8px_rgba(165,214,167,0.3)]" />
                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Value</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div ref={jsonContainerRef} className="flex-1 overflow-auto group/json relative optwin-pro-scroll" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(107, 91, 230, 0.5) rgba(0, 0, 0, 0.2)' }}>
                                        <SmartJsonEditor 
                                            content={jsonContent} 
                                            searchTerm={deferredSearch}
                                            showMissingOnly={showMissingOnly}
                                            originalTranslations={originalTranslations}
                                            origSeoMeta={origSeoMeta}
                                            origPageTitles={origPageTitles}
                                            highlightKey={highlightKey}
                                            onRevert={handleJsonRevert}
                                            onUpdate={handleJsonUpdate}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Global Minimap (Precision Glow markers) ── */}
                        <div className="absolute right-3 w-[8px] pointer-events-none z-[100] bg-white/[0.015] border-x border-white/[0.04]" style={{ top: 45, bottom: 0 }}>
                            <div className="relative w-full h-full">
                                {minimapMarkers.map((pos, i) => (
                                    <div 
                                        key={i} 
                                        className="absolute right-[1px] w-[5px] h-[5px] bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8),0_0_20px_rgba(245,158,11,0.6)] transition-opacity duration-300 rounded-full" 
                                        style={{ top: `${pos}%`, transform: 'translateY(-50%)' }} 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Sağ Sütun: Kenar Çubuğu ── */}
                <div className="h-full overflow-y-auto optwin-pro-scroll relative space-y-4 pr-1 pb-4 flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(107, 91, 230, 0.5) rgba(0, 0, 0, 0.2)' }}>

                    {/* Dil Durumu */}
                    <SidebarSection title="Dil Durumu" icon={<Activity size={13} />} isOpen={statusOpen} onToggle={() => setStatusOpen(p => !p)}>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] font-black text-white/35 uppercase tracking-[0.2em]">Aktif</span>
                            <RippleToggle active={language.isActive} disabled={originalLanguage?.isDefault} onToggle={() => {
                                const newVal = !language.isActive;
                                setLanguage(prev => prev ? ({ ...prev, isActive: newVal }) : null);
                                patchJsonContent({ "_config.isActive": newVal });
                                setIsDirty(true);
                            }} />
                        </div>
                        {language.isDefault ? (
                            <div className="mt-4 flex items-center justify-center p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider gap-2">
                                <Sparkles size={13} /> Varsayılan Dil
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowDefaultModal(true)}
                                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-white/[0.02] hover:bg-amber-500/10 border border-white/[0.05] hover:border-amber-500/30 text-white/50 hover:text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300"
                            >
                                <Globe size={13} /> Varsayılan Yap
                            </button>
                        )}
                    </SidebarSection>

                    {/* İlerleme Kartı */}
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white/[0.02] backdrop-blur-md border border-white/[0.05] rounded-2xl p-5 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.15)]">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[#6b5be6]/[0.06] blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/[0.03] blur-3xl pointer-events-none" />
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Tamamlanma Oranı</span>
                            <span className={`text-[12px] font-black tabular-nums ${progressColor}`}>%{percentage}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden mb-3 relative z-10">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1.2, ease: "circOut" }} className={`h-full rounded-full ${barGradient}`} />
                        </div>

                        {/* Breakdown details */}
                        {breakdown && percentage < 100 && (
                            <div className="space-y-1.5 mb-3 relative z-10">
                                {[
                                    { label: "Arayüz", total: breakdown.uiKeys.total, filled: breakdown.uiKeys.filled },
                                    { label: "SEO", total: breakdown.seoKeys.total, filled: breakdown.seoKeys.filled },
                                    { label: "Sayfalar", total: breakdown.pageKeys.total, filled: breakdown.pageKeys.filled },
                                    { label: "Özellikler", total: breakdown.features.total, filled: breakdown.features.filled },
                                    { label: "Script Et.", total: breakdown.scriptLabels.total, filled: breakdown.scriptLabels.filled },
                                    { label: "Kategoriler", total: breakdown.categories.total, filled: breakdown.categories.filled },
                                ].filter(s => s.total > 0 && s.total - s.filled > 0).map((s, i) => (
                                    <div key={i} className="flex items-center justify-between text-[9px]">
                                        <span className="text-white/25 font-bold uppercase tracking-wider">{s.label}</span>
                                        <span className="text-amber-400/60 font-bold">{s.total - s.filled} eksik</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {missingCount > 0 ? (
                            <button onClick={jumpToNextMissing} className="text-[9px] font-bold text-amber-400/80 hover:text-amber-300 flex items-center gap-1.5 relative z-10 transition-colors group/miss">
                                <AlertCircle size={10} className="group-hover/miss:animate-bounce" /> Şu anda {missingCount} UI key eksik.
                            </button>
                        ) : (
                            <p className="text-[9px] font-bold text-white/25 flex items-center gap-1.5 relative z-10">
                                <Sparkles size={10} className="text-[#00f8da]" /> {percentage >= 100 ? "Tamamlandı" : "UI key'ler tamam"}
                            </p>
                        )}
                        <AnimatePresence>
                            {missingCount > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                                    animate={{ opacity: 1, height: "auto", marginTop: 12 }} 
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="flex items-center gap-2 relative z-10 overflow-hidden"
                                >
                                    <button onClick={handleAITranslate} disabled={isTranslating} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#6b5be6] hover:bg-[#5a4cc2] text-white rounded-xl text-[9px] font-black uppercase tracking-[0.12em] transition-all duration-300 active:scale-95 disabled:opacity-40 shadow-[0_4px_20px_rgba(107,91,230,0.2)] hover:shadow-[0_4px_25px_rgba(107,91,230,0.3)]">
                                        {isTranslating ? <RefreshCw size={11} className="animate-spin" /> : <Bot size={11} />} {isTranslating ? "..." : "AI-ÇEVİRİ"}
                                    </button>
                                    <button onClick={jumpToNextMissing} className="p-2.5 bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.06] text-white/30 hover:text-white border border-white/[0.06] hover:border-[#6b5be6]/30 hover:shadow-[0_0_12px_rgba(107,91,230,0.1)] rounded-xl transition-all duration-300 active:scale-95" title="Sonraki Eksikliğe Git">
                                        <Navigation2 size={14} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Global SEO + Task 1: SeoPreview */}
                    <SidebarSection title="SEO Meta" icon={<Globe size={13} />} isOpen={seoOpen} onToggle={() => setSeoOpen(p => !p)} isWarning={SEO_KEYS.some(k => k !== "twitterCard" && !seoMetadata[k])}>
                        <div className="space-y-3.5 mt-2">
                            {["title", "description", "keywords", "ogTitle", "ogDesc"].map(field => (
                                <div key={field} className={`space-y-1.5 ${highlightKey === `seo.${field}` ? pulseClass : ""}`}>
                                    <label className="text-[10px] font-black text-white/35 uppercase tracking-[0.2em] block">{field}</label>
                                    <input ref={el => { seoRefs.current[field] = el; }} type="text" value={seoMetadata[field] || ""} onChange={e => {
                                        setSeoMetadata((prev: Record<string, string>) => ({ ...prev, [field]: e.target.value }));
                                        patchJsonContent({ [`seo.${field}`]: e.target.value });
                                        setIsDirty(true);
                                    }} className={neonInput} />
                                </div>
                            ))}
                        </div>
                        <SeoPreview title={seoMetadata.title || ""} description={seoMetadata.description || ""} code={code} />
                    </SidebarSection>

                    {/* Page Titles */}
                    <SidebarSection title="Sayfa Başlıkları" icon={<Layout size={13} />} isOpen={ptOpen} onToggle={() => setPtOpen(p => !p)} isWarning={PAGE_KEYS.some(k => !pageTitles[k])}>
                        <div className="space-y-3.5 mt-2">
                            {PAGE_KEYS.map(k => {
                                const route = k.split(".")[1];
                                const labels: Record<string, string> = { home: "Ana Sayfa", contact: "İletişim", support: "Destek", terms: "Koşullar", maintenance: "Bakım" };
                                const label = `${labels[route] || route} Title`;
                                return (
                                    <div key={k} className={`space-y-1.5 ${highlightKey === k ? pulseClass : ""}`}>
                                        <label className="text-[10px] font-black text-white/35 uppercase tracking-[0.2em] block">{label}</label>
                                        <input ref={el => { pageTitleRefs.current[k] = el; }} type="text" value={pageTitles[k] || ""} onChange={e => {
                                            setPageTitles(prev => ({ ...prev, [k]: e.target.value }));
                                            patchJsonContent({ [k]: e.target.value });
                                            setIsDirty(true);
                                        }} className={neonInput} />
                                    </div>
                                );
                            })}
                        </div>
                    </SidebarSection>
                </div>
            </div>

            {/* ── Modals ── */}
            <AnimatePresence>
                {isInfoModalOpen && (
                    <LanguageEditorModal
                        language={language}
                        displayOnly={true}
                        onClose={() => setIsInfoModalOpen(false)}
                        onSave={(up) => {
                            if (up) {
                                setLanguage(up);
                                patchJsonContent({
                                    "_config.name": up.name,
                                    "_config.code": up.code,
                                    "_config.utcOffset": String(up.utcOffset),
                                    "_config.localName": up.nativeName,
                                    "_config.trName": up.turkishName,
                                    "_config.svg": up.flagSvg,
                                    "_config.order": String(up.sortOrder),
                                    "_config.isActive": up.isActive,
                                });
                                setIsDirty(true);
                                if (up.code !== code) setPendingCode(up.code);
                            }
                            setIsInfoModalOpen(false);
                        }}
                    />
                )}
                {showDefaultModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowDefaultModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-[#0d0d12]/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl w-full max-w-md p-6 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.1)]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />
                            <h2 className="text-sm font-black text-white uppercase tracking-tight mb-2 relative z-10 flex items-center gap-2">
                                <AlertCircle size={16} className="text-amber-500" /> Varsayılan Dili Değiştir
                            </h2>
                            
                            <div className="my-6 space-y-4 relative z-10">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                    <div className="flex items-center gap-3">
                                        <FlagIcon flagSvg={defaultLang?.flagSvg ?? ""} size="sm" />
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-white/30 uppercase tracking-tighter">MEVCUT VARSAYILAN</span>
                                            <span className="text-[12px] font-bold text-white/70">{defaultLang?.turkishName} ({defaultLang?.nativeName})</span>
                                        </div>
                                    </div>
                                    <X size={14} className="text-white/10" />
                                </div>

                                <div className="flex justify-center flex-col items-center gap-1 opacity-20">
                                    <ChevronDown size={16} />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                                    <div className="flex items-center gap-3">
                                        <FlagIcon flagSvg={language.flagSvg} size="sm" />
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-amber-500/50 uppercase tracking-tighter">YENİ VARSAYILAN</span>
                                            <span className="text-[12px] font-bold text-amber-500">{language.turkishName} ({language.nativeName})</span>
                                        </div>
                                    </div>
                                    <Sparkles size={14} className="text-amber-500/40" />
                                </div>
                            </div>

                            <p className="text-[10px] text-white/40 mb-6 leading-relaxed relative z-10 text-center px-4">
                                Onayladığınızda platformun ana dili değişecektir. Başlangıç dilleri ve sistem verileri bu dile göre şekillenir.
                            </p>

                            <div className="flex justify-end gap-3 relative z-10">
                                <button onClick={() => setShowDefaultModal(false)} className="px-5 py-2.5 rounded-xl text-[11px] font-bold text-white/40 hover:text-white/70 hover:bg-white/[0.03] transition-all">
                                    İptal
                                </button>
                                <button onClick={handleMakeDefault} className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-black uppercase tracking-wider transition-all shadow-lg active:scale-95">
                                    Onayla
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
