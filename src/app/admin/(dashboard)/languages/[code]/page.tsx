"use client";

import React, { use, useEffect, useState, useMemo, useDeferredValue, memo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";
import { AdminActionBar } from "@/components/admin/AdminActionBar";
import { ArrowLeft, Bot, Globe, RefreshCw, Search, AlertCircle, Activity, Settings2, FileDown, FileUp, ChevronDown, ChevronRight, Layout, Sparkles, XCircle, Navigation2, Keyboard, X } from "lucide-react";
import { useOptWinStore } from "@/store/useOptWinStore";
import { FlagIcon } from "@/components/shared/FlagIcon";
import { Language } from "@/components/admin/languages/LanguageDashboard";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/shared/Loader";
import { LanguageEditorModal } from "@/components/admin/languages/LanguageEditorModal";
import { calculateProgress, SEO_KEYS, PAGE_KEYS } from "@/lib/translationUtils";

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

/* ── Task 3: JSON Syntax Highlighting (zero-dependency) ── */
const JsonHighlighter = memo(({ content, searchTerm }: { content: string; searchTerm: string }) => {
    const highlighted = useMemo(() => {
        if (!content) return [];
        const lines = content.split("\n");
        const term = (searchTerm || "").toLowerCase();

        return lines.map((line, i) => {
            const parts: React.ReactNode[] = [];
            let remaining = line;
            
            // Search highlighting logic
            if (term && line.toLowerCase().includes(term)) {
                // If it's a match, we could highlight the whole line or parts. 
                // For now, let's just make the matching line stand out.
            }

            // Match JSON key-value patterns
            const keyMatch = remaining.match(/^(\s*)"([^"]+)"(\s*:\s*)/);
            if (keyMatch) {
                parts.push(<span key={`${i}-ws`} className="text-white/20">{keyMatch[1]}</span>);
                parts.push(<span key={`${i}-q1`} className="text-white/20">&quot;</span>);
                const isKeyMatch = term && keyMatch[2].toLowerCase().includes(term);
                parts.push(<span key={`${i}-k`} className={`${isKeyMatch ? "bg-[#b39ddb]/30 text-white shadow-[0_0_8px_rgba(179,157,219,0.5)]" : "text-[#b39ddb]"} transition-all`}>{keyMatch[2]}</span>);
                parts.push(<span key={`${i}-q2`} className="text-white/20">&quot;</span>);
                parts.push(<span key={`${i}-col`} className="text-white/25">{keyMatch[3]}</span>);
                remaining = remaining.slice(keyMatch[0].length);
                // Value part
                const strVal = remaining.match(/^"([^"]*)"(,?\s*)$/);
                const numVal = remaining.match(/^(\d+\.?\d*)(,?\s*)$/);
                const boolVal = remaining.match(/^(true|false|null)(,?\s*)$/);
                const braceVal = remaining.match(/^([{}\[\]])(,?\s*)$/);
                
                if (strVal) {
                    parts.push(<span key={`${i}-vq1`} className="text-white/20">&quot;</span>);
                    const isValMatch = term && strVal[1].toLowerCase().includes(term);
                    parts.push(<span key={`${i}-v`} className={`${isValMatch ? "bg-emerald-500/30 text-white shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-[#a5d6a7]"} transition-all`}>{strVal[1]}</span>);
                    parts.push(<span key={`${i}-vq2`} className="text-white/20">&quot;</span>);
                    parts.push(<span key={`${i}-comma`} className="text-white/15">{strVal[2]}</span>);
                } else if (numVal) {
                    parts.push(<span key={`${i}-n`} className="text-[#ffcc80]">{numVal[1]}</span>);
                    parts.push(<span key={`${i}-nc`} className="text-white/15">{numVal[2]}</span>);
                } else if (boolVal) {
                    parts.push(<span key={`${i}-b`} className="text-[#ef9a9a]">{boolVal[1]}</span>);
                    parts.push(<span key={`${i}-bc`} className="text-white/15">{boolVal[2]}</span>);
                } else if (braceVal) {
                    parts.push(<span key={`${i}-br`} className="text-white/30">{braceVal[1]}</span>);
                    parts.push(<span key={`${i}-brc`} className="text-white/15">{braceVal[2]}</span>);
                } else {
                    parts.push(<span key={`${i}-rest`} className="text-white/40">{remaining}</span>);
                }
            } else {
                // Non-key lines (braces, empty)
                const braceOnly = line.match(/^(\s*)([{}\[\],]*)(\s*)$/);
                if (braceOnly) {
                    parts.push(<span key={`${i}-bw`} className="text-white/20">{braceOnly[1]}</span>);
                    parts.push(<span key={`${i}-bo`} className="text-white/30">{braceOnly[2]}</span>);
                } else {
                    parts.push(<span key={`${i}-raw`} className="text-white/40">{line}</span>);
                }
            }
            return <div key={i} className={`leading-relaxed transition-opacity duration-300 ${term && !line.toLowerCase().includes(term) ? "opacity-30" : "opacity-100"}`}>{parts}</div>;
        });
    }, [content, searchTerm]);
    return <div className="font-mono text-[13px] whitespace-pre">{highlighted}</div>;
});
JsonHighlighter.displayName = "JsonHighlighter";

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
                    <textarea ref={forwardRef as React.Ref<HTMLTextAreaElement>} value={trText} onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })} onChange={e => onUpdate(k, e.target.value)} placeholder="..." rows={3} className={`${neonInput} p-4 resize-none min-h-[60px] custom-scrollbar text-[14px] leading-6`} />
                ) : (
                    <input ref={forwardRef as React.Ref<HTMLInputElement>} type="text" value={trText} onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })} onChange={e => onUpdate(k, e.target.value)} placeholder="..." className={`${neonInput} px-5 py-3.5 font-medium text-[14px] leading-6`} />
                )}
                {isEmpty && <div className="absolute top-3 right-4 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.7)]" />}
            </div>
        </div>
    );
}, (prev, next) => prev.k === next.k && prev.trText === next.trText && prev.defText === next.defText);
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
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-4 border-t border-white/[0.03]">{children}</div>
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
    const [openSidebars, setOpenSidebars] = useState<Record<string, boolean>>({ status: true, seo: false, pt: false });
    const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
    const jsonContainerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const seoRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const pageTitleRefs = useRef<Record<string, HTMLInputElement | null>>({});

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
                        setOriginalLanguage(JSON.parse(JSON.stringify(curr)));
                        const seo = (curr as any).seoMetadata || {};
                        setSeoMetadata(seo);
                        setOrigSeoMeta(JSON.parse(JSON.stringify(seo)));
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
                    setOriginalTranslations(JSON.parse(JSON.stringify(ui)));
                    setPageTitles(pt);
                    setOrigPageTitles(JSON.parse(JSON.stringify(pt)));
                }
            } catch {
                setError("Veriler yüklenirken hata oluştu.");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [code]);

    /* ── JSON Sync ── */
    const constructVirtualJson = useCallback((ui: any, seo: any, pt: any, lang: Language | null, searchStr: string, hideFilled: boolean) => {
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

        // 4. Config (Only if not searching/filtering)
        if (!term && !hideFilled) {
            out["_config"] = { 
                name: lang.name, 
                code: lang.code, 
                utcOffset: lang.utcOffset, 
                localName: lang.nativeName, 
                trName: lang.turkishName, 
                svg: lang.flagSvg, 
                order: lang.sortOrder, 
                isActive: lang.isActive, 
                isDefault: lang.isDefault 
            };
        }
        
        return JSON.stringify(out, null, 4);
    }, [defaultTrans]);

    const deconstructVirtualJson = useCallback((jsonStr: string) => {
        try {
            const parsed = JSON.parse(jsonStr);
            const ui: any = {}; const seoPartial: any = {}; const ptPartial: any = {}; const meta = parsed["_config"] || {};
            
            Object.keys(parsed).forEach(k => {
                if (k === "_config") return;
                if (k.startsWith("seo.")) { seoPartial[k.replace("seo.", "")] = parsed[k] || ""; }
                else if (k.startsWith("page.")) ptPartial[k] = parsed[k] || "";
                else ui[k] = parsed[k] || "";
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
                        utcOffset: meta.utcOffset ?? prev.utcOffset, 
                        isActive: meta.isActive ?? prev.isActive, 
                        isDefault: meta.isDefault ?? prev.isDefault, 
                        sortOrder: meta.order ?? prev.sortOrder 
                    };
                });
            }
        } catch (e) {
            console.warn("JSON Sync Parse Error");
        }
    }, [setTranslations, setSeoMetadata, setPageTitles, setLanguage]);

    const lastSearch = useRef(deferredSearch);
    const lastMissing = useRef(showMissingOnly);

    useEffect(() => {
        const filtersChanged = lastSearch.current !== deferredSearch || lastMissing.current !== showMissingOnly;
        lastSearch.current = deferredSearch;
        lastMissing.current = showMissingOnly;

        if (!isJsonMode || filtersChanged) {
            if (language) setJsonContent(constructVirtualJson(translations, seoMetadata, pageTitles, language, deferredSearch, showMissingOnly));
        }
    }, [translations, seoMetadata, pageTitles, language, isJsonMode, deferredSearch, showMissingOnly, constructVirtualJson]);

    const handleRawJsonChange = (val: string) => { 
        setJsonContent(val); 
        try {
            JSON.parse(val);
            deconstructVirtualJson(val);
        } catch {}
    };

    // Automatic Sync to JSON content whenever UI state changes
    useEffect(() => {
        if (!isJsonMode && language) {
            const nextJson = constructVirtualJson(translations, seoMetadata, pageTitles, language, deferredSearch, showMissingOnly);
            if (nextJson !== jsonContent) {
                setJsonContent(nextJson);
            }
        }
    }, [translations, seoMetadata, pageTitles, language, isJsonMode, deferredSearch, showMissingOnly, constructVirtualJson, jsonContent]);

    const toggleJsonMode = () => {
        if (!isJsonMode) {
             setJsonContent(constructVirtualJson(translations, seoMetadata, pageTitles, language, deferredSearch, showMissingOnly));
        } else {
             deconstructVirtualJson(jsonContent);
             // Force table re-render to ensure virtualizer measurements are fresh
             if (virtualizer) {
                virtualizer.measure();
             }
        }
        setIsJsonMode(!isJsonMode);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const imported = JSON.parse(ev.target?.result as string);
                setJsonContent(JSON.stringify(imported, null, 4));
                deconstructVirtualJson(JSON.stringify(imported));
                showToast("İçe aktarma başarılı.", "success");
            } catch { showToast("Hatalı JSON.", "error"); }
        };
        reader.readAsText(file);
    };

    /* ── Change Detection ── */
    const hasChanges = useMemo(() => {
        // Use a consistent serialization for comparison to avoid "false positives" from order or whitespace
        const serialize = (obj: any) => JSON.stringify(Object.keys(obj).sort().reduce((acc: any, k) => { acc[k] = obj[k]; return acc; }, {}));
        
        const trChanged = serialize(translations) !== serialize(originalTranslations);
        const seoChanged = serialize(seoMetadata) !== serialize(origSeoMeta);
        const pTitlesChanged = serialize(pageTitles) !== serialize(origPageTitles);
        
        const metaChanged = 
            language?.isActive !== originalLanguage?.isActive || 
            language?.isDefault !== originalLanguage?.isDefault || 
            language?.name !== originalLanguage?.name || 
            language?.nativeName !== originalLanguage?.nativeName || 
            language?.flagSvg !== originalLanguage?.flagSvg || 
            language?.utcOffset !== originalLanguage?.utcOffset || 
            language?.sortOrder !== originalLanguage?.sortOrder || 
            pendingCode !== null;

        return trChanged || seoChanged || pTitlesChanged || metaChanged;
    }, [translations, originalTranslations, seoMetadata, origSeoMeta, pageTitles, origPageTitles, language, originalLanguage, pendingCode]);

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
                setOriginalTranslations(JSON.parse(JSON.stringify(translations)));
                setOrigPageTitles(JSON.parse(JSON.stringify(pageTitles)));
                setOrigSeoMeta(JSON.parse(JSON.stringify(seoMetadata)));
                if (language) setOriginalLanguage(JSON.parse(JSON.stringify(language)));
                setSaved(true);
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
        setTranslations(JSON.parse(JSON.stringify(originalTranslations)));
        setPageTitles(JSON.parse(JSON.stringify(origPageTitles)));
        setSeoMetadata(JSON.parse(JSON.stringify(origSeoMeta)));
        if (originalLanguage) setLanguage(JSON.parse(JSON.stringify(originalLanguage)));
        setPendingCode(null);
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

    /* ── AI Translation ── */
    const handleAITranslate = async () => {
        const missingKeys = Object.keys(defaultTrans).filter(k => !translations[k]);
        if (missingKeys.length === 0 || !language || !defaultLang) return;
        setIsTranslating(true);
        try {
            const res = await fetch("/api/admin/languages/ai-translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetLang: language.nativeName, translations: Object.fromEntries(missingKeys.map(k => [k, defaultTrans[k]])) })
            });
            const data = await res.json();
            if (data.success) {
                setTranslations(prev => ({ ...prev, ...data.translations }));
                showToast("Eksikler tamamlandı.", "success");
            }
        } finally {
            setIsTranslating(false);
        }
    };

    /* ── Computed ── */
    const allKeys = useMemo(() => Object.keys(defaultTrans).filter(k => !k.startsWith("page.")), [defaultTrans]);
    const filteredKeys = useMemo(() => allKeys.filter(k => (!showMissingOnly || !translations[k]) && (!deferredSearch || k.toLowerCase().includes(deferredSearch.toLowerCase()))), [allKeys, showMissingOnly, deferredSearch, translations]);
    const { percentage, missingCount } = useMemo(() => calculateProgress({ ...translations, ...pageTitles }, seoMetadata, allKeys), [translations, pageTitles, seoMetadata, allKeys]);
    const minimapMarkers = useMemo(() => filteredKeys.map((k, i) => !translations[k] ? (i / filteredKeys.length) * 100 : null).filter(p => p !== null) as number[], [filteredKeys, translations]);

    const parentRef = useRef<HTMLDivElement>(null);
    const virtualizer = useVirtualizer({
        count: filteredKeys.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 82, 
        overscan: 10,
    });

    /* ── Task 2: Smart Jump with Highlight Pulse ── */
    const jumpToNextMissing = useCallback(() => {
        if (isJsonMode) {
            const lines = jsonContent.split("\n");
            const targetLine = lines.findIndex(l => l.includes(': ""'));
            if (targetLine !== -1) {
                const el = jsonContainerRef.current;
                if (el) {
                    el.scrollTo({ top: targetLine * 24 - 100, behavior: "smooth" });
                }
                showToast(`Satır ${targetLine + 1} üzerinde eksik değer bulundu.`, "success");
                return;
            }
        }

        // 1. Check current filtered list (translations)
        const nextTrIndex = filteredKeys.findIndex(k => !translations[k]);
        if (nextTrIndex !== -1) {
            const nextTr = filteredKeys[nextTrIndex];
            setHighlightKey(nextTr);
            virtualizer.scrollToIndex(nextTrIndex, { align: "center" });
            setTimeout(() => inputRefs.current[nextTr]?.focus(), 150);
            setTimeout(() => setHighlightKey(null), 1500);
            return;
        }

        // 2. Check ALL translations (might be hidden by search)
        const globalNextKey = allKeys.find(k => !translations[k]);
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
            setOpenSidebars(p => ({ ...p, seo: true }));
            setTimeout(() => {
                seoRefs.current[nextSeo]?.focus();
                seoRefs.current[nextSeo]?.scrollIntoView({ behavior: "smooth", block: "center" });
                setHighlightKey(`seo.${nextSeo}`);
            }, 350);
            setTimeout(() => setHighlightKey(null), 1800);
            return;
        }

        // 4. Check page titles
        const nextPt = PAGE_KEYS.find(k => !pageTitles[k]);
        if (nextPt) {
            setOpenSidebars(p => ({ ...p, pt: true }));
            setTimeout(() => {
                pageTitleRefs.current[nextPt]?.focus();
                pageTitleRefs.current[nextPt]?.scrollIntoView({ behavior: "smooth", block: "center" });
                setHighlightKey(nextPt);
            }, 350);
            setTimeout(() => setHighlightKey(null), 1800);
            return;
        }
        showToast("Tüm alanlar tamamlanmış görünüyor!", "success");
    }, [translations, seoMetadata, pageTitles, isJsonMode, jsonContent, filteredKeys, allKeys, virtualizer, showToast]);

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
    const pulseClass = "ring-2 ring-[#6b5be6]/50 shadow-[0_0_25px_rgba(107,91,230,0.3)] bg-[#6b5be6]/5";

    return (
        <div className="w-full h-[calc(100vh-90px)] max-w-[1920px] mx-auto flex flex-col pt-6 pb-2 px-4 lg:px-8 overflow-hidden">
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
                    <button onClick={() => setIsInfoModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-white/[0.04] backdrop-blur-md hover:bg-[#6b5be6]/20 border border-white/[0.1] hover:border-[#6b5be6]/50 hover:shadow-[0_0_25px_rgba(107,91,230,0.2)] text-white/70 hover:text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 shrink-0">
                        <Settings2 size={14} /> DÜZENLE
                    </button>
                    <label className="flex items-center gap-2 px-6 py-3 bg-white/[0.04] backdrop-blur-md hover:bg-emerald-500/15 border border-white/[0.1] hover:border-emerald-500/40 text-white/50 hover:text-emerald-400 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer active:scale-95 shrink-0 group">
                        <FileUp size={14} className="group-hover:animate-bounce" /><span className="font-black">İÇE AKTAR</span>
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </label>
                    <button onClick={() => {
                        const blob = new Blob([jsonContent], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url; a.download = `${code}.json`; a.click();
                        URL.revokeObjectURL(url);
                    }} className="flex items-center gap-2 px-6 py-3 bg-white/[0.04] backdrop-blur-md hover:bg-amber-500/15 border border-white/[0.1] hover:border-amber-500/40 text-white/50 hover:text-amber-400 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 shrink-0 group">
                        <FileDown size={14} className="group-hover:animate-pulse" /><span className="font-black">DIŞA AKTAR</span>
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
                            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-mono text-white/15 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">Ctrl+F</kbd>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={toggleJsonMode} className={`px-5 py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 active:scale-95 ${isJsonMode ? "bg-[#6b5be6] text-white border-[#6b5be6] shadow-[0_0_20px_rgba(107,91,230,0.3)] hover:bg-[#5a4cc2] hover:shadow-[0_0_25px_rgba(107,91,230,0.4)]" : "bg-white/[0.02] text-white/50 border-white/[0.06] hover:border-[#6b5be6]/40 hover:text-white hover:bg-white/[0.04] hover:shadow-[0_0_15px_rgba(107,91,230,0.15)]"}`}>
                                {isJsonMode ? "UI MODU" : "RAW JSON"}
                            </button>
                            <button onClick={() => setShowMissingOnly(!showMissingOnly)} className={`px-5 py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 active:scale-95 ${showMissingOnly ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]" : "bg-white/[0.02] text-white/50 border-white/[0.06] hover:border-amber-500/40 hover:text-white hover:bg-white/[0.04] hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]"}`}>
                                EKSİKLER
                            </button>
                        </div>
                    </div>

                    {/* ── Translation Area ── */}
                    <div className="flex-1 min-h-0 bg-white/[0.015] backdrop-blur-md border border-white/[0.05] rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.25)] relative flex flex-col group border-b-0">
                        <AnimatePresence mode="wait">
                            {!isJsonMode ? (
                                <motion.div key="ui-mode" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2, ease: "easeOut" }} className="flex flex-col h-full absolute inset-0">
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
                                                {/* REMOVED: VARSAYILAN and Düzenle button from here */}
                                            </div>
                                        </div>
                                    </div>
                                    <div ref={parentRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
                                        {filteredKeys.length > 0 ? (
                                            <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
                                                {virtualizer.getVirtualItems().map((vItem) => {
                                                    const k = filteredKeys[vItem.index];
                                                    return (
                                                        <div key={k} data-index={vItem.index} ref={virtualizer.measureElement} style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${vItem.start}px)` }} className={highlightKey === k ? pulseClass : ""}>
                                                            <TranslationRow k={k} defText={defaultTrans[k]} trText={translations[k] || ""} isMissingInDb={!originalTranslations[k]} onUpdate={(k, v) => setTranslations(prev => ({ ...prev, [k]: v }))} forwardRef={el => { inputRefs.current[k] = el; }} />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-20 text-center space-y-4"><XCircle size={36} className="text-white/8 mx-auto" /><p className="text-white/25 text-[10px] font-black uppercase tracking-[0.2em]">Sonuç bulunamadı</p></div>
                                        )}
                                        <div className="absolute right-0 top-0 w-1.5 h-full bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none rounded-r-xl">
                                            {minimapMarkers.map((pos, i) => <div key={i} className="absolute left-0 w-full h-[3px] bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.6)] rounded-full" style={{ top: `${pos}%` }} />)}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                /* ── Task 3: Syntax-highlighted JSON ── */
                                <motion.div key="json-mode" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.3, ease: "easeOut" }} className="flex flex-col h-full absolute inset-0 z-10">
                                    <div className="bg-white/[0.02] backdrop-blur-md border-b border-white/[0.05] h-[45px] px-6 flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-[#6b5be6] uppercase tracking-[0.25em]">Raw JSON Editor</span>
                                            <span className="text-[8px] text-white/10 font-bold uppercase tracking-widest hidden sm:inline">— Veri Kaynağı</span>
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
                                        <div ref={jsonContainerRef} className="flex-1 overflow-auto custom-scrollbar group/json bg-black/[0.1] relative">
                                            <div className="relative p-10 font-mono text-[14px] leading-6 min-h-full isolate" style={{ display: 'grid' }}>
                                                <textarea 
                                                    value={jsonContent} 
                                                    onChange={e => handleRawJsonChange(e.target.value)} 
                                                    spellCheck={false} 
                                                    className="absolute inset-0 w-full h-full bg-transparent p-10 outline-none resize-none leading-6 text-transparent caret-white selection:bg-white/20 z-20 font-mono text-[14px] overflow-hidden whitespace-pre" 
                                                />
                                                {/* Sizing element to push grid rows - Must Match Textarea Exactly */}
                                                <div aria-hidden="true" className="invisible leading-6 whitespace-pre font-mono text-[14px] col-start-1 row-start-1 pointer-events-none pb-12 z-0">
                                                    {jsonContent + '\n\n'}
                                                </div>
                                                {/* Highlighting - Must Match Textarea Exactly */}
                                                <div className="relative pointer-events-none z-10 leading-6 font-mono text-[14px] col-start-1 row-start-1 whitespace-pre">
                                                    <JsonHighlighter content={jsonContent} searchTerm={deferredSearch} />
                                                </div>
                                            </div>
                                        </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Sağ Sütun: Kenar Çubuğu ── */}
                <div className="h-full overflow-y-auto custom-scrollbar space-y-4 pr-1 pb-4 flex-1">

                    {/* Dil Durumu */}
                    <SidebarSection title="Dil Durumu" icon={<Activity size={13} />} isOpen={openSidebars.status} onToggle={() => setOpenSidebars(p => ({ ...p, status: !p.status }))}>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] font-black text-white/35 uppercase tracking-[0.2em]">Aktif</span>
                            <RippleToggle active={language.isActive} disabled={originalLanguage?.isDefault} onToggle={() => setLanguage(prev => prev ? ({ ...prev, isActive: !prev.isActive }) : null)} />
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
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">İlerleme</span>
                            <span className={`text-[12px] font-black tabular-nums ${progressColor}`}>%{percentage}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden mb-3 relative z-10">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1.2, ease: "circOut" }} className={`h-full rounded-full ${barGradient}`} />
                        </div>
                        {/* Task 2: Interactive missing counter */}
                        {missingCount > 0 ? (
                            <button onClick={jumpToNextMissing} className="text-[9px] font-bold text-amber-400/80 hover:text-amber-300 flex items-center gap-1.5 relative z-10 transition-colors group/miss">
                                <AlertCircle size={10} className="group-hover/miss:animate-bounce" /> Şu anda {missingCount} eksik var.
                            </button>
                        ) : (
                            <p className="text-[9px] font-bold text-white/25 flex items-center gap-1.5 relative z-10">
                                <Sparkles size={10} className="text-[#00f8da]" /> Tamamlandı
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
                        {/* Task 5: Save shortcut hint */}
                        <div className="mt-2 pt-2 border-t border-white/[0.03] flex items-center justify-center gap-2 relative z-10">
                            <Keyboard size={10} className="text-white/15" />
                            <span className="text-[8px] font-mono text-white/15">Ctrl+S Kaydet</span>
                        </div>
                    </motion.div>

                    {/* Global SEO + Task 1: SeoPreview */}
                    <SidebarSection title="SEO Meta" icon={<Globe size={13} />} isOpen={openSidebars.seo} onToggle={() => setOpenSidebars(p => ({ ...p, seo: !p.seo }))} isWarning={SEO_KEYS.some(k => k !== "twitterCard" && !seoMetadata[k])}>
                        <div className="space-y-3.5 mt-2">
                            {["title", "description", "keywords", "ogTitle", "ogDesc"].map(field => (
                                <div key={field} className={`space-y-1.5 ${highlightKey === `seo.${field}` ? pulseClass : ""}`}>
                                    <label className="text-[10px] font-black text-white/35 uppercase tracking-[0.2em] block">{field}</label>
                                    <input ref={el => { seoRefs.current[field] = el; }} type="text" value={seoMetadata[field] || ""} onChange={e => setSeoMetadata({ ...seoMetadata, [field]: e.target.value })} className={neonInput} />
                                </div>
                            ))}
                        </div>
                        <SeoPreview title={seoMetadata.title || ""} description={seoMetadata.description || ""} code={code} />
                    </SidebarSection>

                    {/* Page Titles */}
                    <SidebarSection title="Sayfa Başlıkları" icon={<Layout size={13} />} isOpen={openSidebars.pt} onToggle={() => setOpenSidebars(p => ({ ...p, pt: !p.pt }))} isWarning={PAGE_KEYS.some(k => !pageTitles[k])}>
                        <div className="space-y-3.5 mt-2">
                            {PAGE_KEYS.map(k => {
                                const route = k.split(".")[1];
                                const labels: Record<string, string> = { home: "Ana Sayfa", contact: "İletişim", support: "Destek", terms: "Koşullar", maintenance: "Bakım" };
                                const label = `${labels[route] || route} Title`;
                                return (
                                    <div key={k} className={`space-y-1.5 ${highlightKey === k ? pulseClass : ""}`}>
                                        <label className="text-[10px] font-black text-white/35 uppercase tracking-[0.2em] block">{label}</label>
                                        <input ref={el => { pageTitleRefs.current[k] = el; }} type="text" value={pageTitles[k] || ""} onChange={e => setPageTitles({ ...pageTitles, [k]: e.target.value })} className={neonInput} />
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
                                if (up.code !== code) setPendingCode(up.code);
                            }
                            setIsInfoModalOpen(false);
                        }}
                    />
                )}
                {showDefaultModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
