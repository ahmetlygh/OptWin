import React, { useRef, useLayoutEffect, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Check, X, ArrowUp, ArrowDown, Filter, Search } from "lucide-react";
import { LABEL_DESCRIPTIONS } from "./ScriptSettingsTypes";

export interface LabelsTableRef {
    jumpToNextMissing?: () => void;
}

interface LabelsTableProps {
    keys: string[];
    currentLabels: Record<string, string>;
    originalLabels: Record<string, Record<string, string>>;
    activeLang: string;
    showNewRow: boolean;
    setShowNewRow: (s: boolean) => void;
    newKey: string;
    setNewKey: (s: string) => void;
    newValue: string;
    setNewValue: (s: string) => void;
    suggestions: string[];
    handleSelectSuggestion: (s: string) => void;
    handleNewKeyChange: (s: string) => void;
    handleAddRow: () => void;
    handleRenameKey: (old: string, n: string) => void;
    handleValueChange: (k: string, v: string) => void;
    setDeleteConfirmKey: (k: string) => void;
    handleMoveUp: (k: string) => void;
    handleMoveDown: (k: string) => void;
}

export const LabelsTable = React.memo(forwardRef<LabelsTableRef, LabelsTableProps>(({
    keys,
    currentLabels,
    originalLabels,
    activeLang,
    showNewRow,
    setShowNewRow,
    newKey,
    setNewKey,
    newValue,
    setNewValue,
    suggestions,
    handleSelectSuggestion,
    handleNewKeyChange,
    handleAddRow,
    handleRenameKey,
    handleValueChange,
    setDeleteConfirmKey,
    handleMoveUp,
    handleMoveDown
}, ref) => {
    const newKeyRef = useRef<HTMLInputElement>(null);
    const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [missingPositions, setMissingPositions] = useState<number[]>([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [showMissingOnly, setShowMissingOnly] = useState(false);

    // CSS-based animation state for the filter badge button
    const [filterBtnMounted, setFilterBtnMounted] = useState(false);
    const [filterBtnClass, setFilterBtnClass] = useState("missing-badge-enter");

    const searchRef = useRef<HTMLInputElement>(null);

    // Use currentLabels for missing detection so it dynamically updates when typing
    const missingKeys = React.useMemo(() => {
        if (activeLang === "en") return [];
        return keys.filter(key => {
            const val = currentLabels[key];
            return !val || val.trim() === "";
        });
    }, [activeLang, keys, currentLabels]);

    const missingCount = missingKeys.length;

    useEffect(() => {
        const shouldShow = missingCount > 0;
        
        if (shouldShow && !filterBtnMounted) {
            setFilterBtnClass("missing-badge-enter");
            setFilterBtnMounted(true);
        } else if (!shouldShow && filterBtnMounted) {
            setFilterBtnClass("missing-badge-exit");
            const t = setTimeout(() => {
                setFilterBtnMounted(false);
                setShowMissingOnly(false); // reset filter if tracking hits 0
            }, 310);
            return () => clearTimeout(t);
        }
    }, [missingCount, filterBtnMounted]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "f") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    useLayoutEffect(() => {
        Object.values(textareaRefs.current).forEach(t => {
            if (t) {
                t.style.height = "auto";
                t.style.height = t.scrollHeight + "px";
            }
        });
    }, [currentLabels]);

    const filteredKeys = React.useMemo(() => {
        return keys.filter(key => {
            if (showMissingOnly && activeLang !== "en") {
                if (!missingKeys.includes(key)) return false;
            }
            if (searchQuery) {
                const lowQ = searchQuery.toLowerCase();
                const val = currentLabels[key] || "";
                if (!key.toLowerCase().includes(lowQ) && !val.toLowerCase().includes(lowQ)) return false;
            }
            return true;
        });
    }, [keys, showMissingOnly, activeLang, missingKeys, searchQuery, currentLabels]);

    const updateScrollbarSpots = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container || missingCount === 0 || showMissingOnly) {
            setMissingPositions(prev => prev.length === 0 ? prev : []);
            return;
        }
        const spots: number[] = [];
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        if (scrollHeight > clientHeight) {
            missingKeys.forEach(k => {
                const el = rowRefs.current[k];
                if (el) {
                    const top = el.offsetTop;
                    const ratio = top / scrollHeight;
                    spots.push(ratio * 100);
                }
            });
        }
        setMissingPositions(prev => {
            if (prev.length === spots.length && prev.every((v, i) => Math.abs(v - spots[i]) < 0.01)) return prev;
            return spots;
        });
    }, [missingKeys, missingCount, showMissingOnly]);

    useLayoutEffect(() => {
        updateScrollbarSpots();
    }, [updateScrollbarSpots, filteredKeys, activeLang, currentLabels]);

    useEffect(() => {
        const handleResize = () => updateScrollbarSpots();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [updateScrollbarSpots]);

    useImperativeHandle(ref, () => ({
        jumpToNextMissing: () => {
            const container = scrollContainerRef.current;
            if (!container || missingCount === 0) return;
            
            const currentScroll = container.scrollTop;
            let nextRow: HTMLDivElement | null = null;
            
            // Find the first missing row that is substantially below the current viewport
            for (const key of filteredKeys) {
                if (missingKeys.includes(key)) {
                    const row = rowRefs.current[key];
                    if (row && row.offsetTop > currentScroll + 80) {
                        nextRow = row;
                        break;
                    }
                }
            }
            
            // Wrap around
            if (!nextRow) {
                for (const key of filteredKeys) {
                    if (missingKeys.includes(key)) {
                        nextRow = rowRefs.current[key];
                        break;
                    }
                }
            }
            
            if (nextRow) {
                container.scrollTo({ top: nextRow.offsetTop - 20, behavior: 'smooth' });
                nextRow.style.transition = "none";
                nextRow.style.boxShadow = "inset 0 0 0 2px rgba(245, 158, 11, 0.8), inset 0 0 20px rgba(245, 158, 11, 0.4)";
                nextRow.style.backgroundColor = "rgba(245, 158, 11, 0.15)";
                
                // Force reflow and apply fade out
                void nextRow.offsetHeight;
                
                nextRow.style.transition = "all 0.5s ease-out";
                setTimeout(() => {
                    if (nextRow) {
                        nextRow.style.boxShadow = "inset 0 0 0 0px rgba(245, 158, 11, 0)";
                        nextRow.style.backgroundColor = "";
                    }
                }, 500);
            }
        }
    }));

    return (
        <div className="rounded-2xl border border-white/5 bg-white/2 backdrop-blur-md overflow-hidden flex flex-col h-full shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
            <div className="px-5 py-3 border-b border-white/4 bg-white/1 flex flex-col xl:flex-row xl:items-center justify-between shrink-0 gap-3">
                <div className="flex items-center gap-3">
                    <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] hidden sm:block">ANAHTAR-DEĞER</h3>
                    <span className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-white/40 font-mono font-bold tracking-wider">
                        {activeLang !== "en" && missingCount > 0
                            ? <><span className="text-amber-400">{keys.length - missingCount}</span>/{keys.length} etiket</>
                            : <>{filteredKeys.length} / {keys.length} etiket</>
                        }
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {filterBtnMounted && (
                        <div className={`relative z-50 flex items-center shrink-0 ${filterBtnClass}`} style={{ willChange: 'transform, opacity' }}>
                            <button
                                onClick={() => setShowMissingOnly(!showMissingOnly)}
                                className={`h-8 px-3 flex items-center gap-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border shrink-0 cursor-pointer relative overflow-hidden ${
                                    showMissingOnly
                                        ? "bg-linear-to-r from-red-500/15 to-amber-500/15 border-amber-500/40 text-amber-400 shadow-[0_4px_15px_rgba(245,158,11,0.1)]"
                                        : "bg-white/3 border-white/8 text-white/40 hover:bg-white/6 hover:text-white/60"
                                }`}
                            >
                                {showMissingOnly && (
                                    <span className="absolute inset-0 bg-linear-to-r from-transparent via-amber-300/10 to-transparent missing-badge-shine pointer-events-none" />
                                )}
                                <Filter size={11} className={showMissingOnly ? "text-amber-400" : "text-white/30"} />
                                EKSİKLERİ FİLTRELE
                                {missingCount > 0 && (
                                    <span className={`flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded text-[9px] font-black ${
                                        showMissingOnly ? "bg-amber-500/30 text-amber-300 border border-amber-500/30" : "bg-white/7 text-white/30 border border-white/6"
                                    }`}>{missingCount}</span>
                                )}
                            </button>
                        </div>
                    )}
                    <div className="relative w-full sm:w-auto sm:min-w-[200px]">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                        <input
                            ref={searchRef}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Anahtar veya çeviri ara..."
                            className="h-8 w-full bg-[#0a0a0f] border border-white/5 rounded-lg pl-8 pr-3 text-[11px] font-medium text-white/90 placeholder-white/20 hover:border-white/10 focus:border-[#6b5be6]/50 focus:bg-[#6b5be6]/2 focus:outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(107,91,230,0.15)] ring-1 ring-transparent focus:ring-[#6b5be6]/30"
                        />
                    </div>
                </div>
            </div>
            
            <div className="flex-1 relative min-h-0">
                {/* Scrollbar glowing dots container placed absolutely over the scroll container track */}
                {missingPositions.length > 0 && (
                    <div className="absolute right-0 top-0 bottom-0 w-[5px] pointer-events-none overflow-hidden z-20">
                        {missingPositions.map((pos, idx) => (
                            <div 
                                key={`dot-${idx}`}
                                className="absolute right-0 w-[3px] h-[4px] bg-amber-400 rounded-full blur-[0.5px] opacity-70"
                                style={{ top: `${pos}%` }}
                            />
                        ))}
                    </div>
                )}
                <div ref={scrollContainerRef} className="absolute inset-0 overflow-y-auto optwin-pro-scroll custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(107, 91, 230, 0.5) transparent' }}>
                    {filteredKeys.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center opacity-30">
                            <span className="text-[11px] font-black tracking-widest uppercase">Sonuç Bulunamadı</span>
                        </div>
                    ) : filteredKeys.map((key, i) => {
                    const original = originalLabels[activeLang]?.[key];
                    const current = currentLabels[key];
                    const changed = original !== undefined && original !== current;

                    const isMissing = missingKeys.includes(key);

                    return (
                        <div key={key} ref={el => { rowRefs.current[key] = el; }} className={`flex flex-col sm:flex-row p-3 gap-2 border-b border-white/3 transition-colors group/row ${(changed && !isMissing) ? "bg-[#6b5be6]/5" : ""} ${isMissing ? "bg-amber-500/8" : "hover:bg-white/5"}`}>
                            
                            <div className="flex items-start sm:items-center sm:w-[220px] shrink-0 gap-3">
                                <span className="text-center text-[10px] font-mono font-bold text-white/20 pt-1 shrink-0 w-6">{i + 1}</span>
                                <div className="flex-1">
                                    <input
                                        defaultValue={key}
                                        onBlur={e => {
                                            const nk = e.target.value.trim();
                                            if (nk && nk !== key) handleRenameKey(key, nk);
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                            if (e.key === "Escape") { (e.target as HTMLInputElement).value = key; (e.target as HTMLInputElement).blur(); }
                                        }}
                                        className="w-full text-[12px] font-mono font-bold text-white/70 bg-transparent border border-transparent hover:border-[#6b5be6]/30 focus:border-[#6b5be6]/60 rounded focus:bg-[#6b5be6]/5 px-2 py-1 focus:outline-none transition-all placeholder-white/20"
                                        title="Anahtar adını düzenle"
                                        placeholder="Anahtar (Key)"
                                    />
                                    {LABEL_DESCRIPTIONS[key] && (
                                        <p className="text-[9px] text-white/30 mt-1 leading-tight px-2">{LABEL_DESCRIPTIONS[key]}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-center">
                                <textarea
                                    ref={el => { textareaRefs.current[key] = el; }}
                                    value={current || ""}
                                    onChange={e => handleValueChange(key, e.target.value)}
                                    onKeyDown={e => { if (e.key === "Escape") (e.target as HTMLTextAreaElement).blur(); }}
                                    rows={1}
                                    placeholder="Değer girin..."
                                    className="w-full bg-white/2 border border-white/4 p-2 hover:border-[#6b5be6]/30 hover:bg-[#6b5be6]/2 focus:border-[#6b5be6]/50 focus:bg-[#6b5be6]/5 rounded-xl text-[13px] text-white/80 placeholder-white/20 focus:outline-none transition-all resize-none shadow-sm pb-2.5"
                                    style={{ minHeight: "38px", scrollbarWidth: "none" }}
                                    onInput={(e) => {
                                        const t = e.target as HTMLTextAreaElement;
                                        t.style.height = "auto";
                                        t.style.height = t.scrollHeight + "px";
                                    }}
                                />
                            </div>

                            <div className="shrink-0 flex items-center justify-end px-1 sm:w-20 gap-1 opacity-0 group-hover/row:opacity-100 transition-all">
                                <div className="flex flex-col gap-1 mr-1">
                                    <button 
                                        onClick={() => handleMoveUp(key)}
                                        disabled={i === 0 || searchQuery !== "" || showMissingOnly}
                                        className="size-4 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors disabled:opacity-0 disabled:cursor-auto cursor-pointer"
                                         title="Yukarı Taşı"
                                     ><ArrowUp size={10} /></button>
                                     <button 
                                         onClick={() => handleMoveDown(key)}
                                         disabled={i === filteredKeys.length - 1 || searchQuery !== "" || showMissingOnly}
                                         className="size-4 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors disabled:opacity-0 disabled:cursor-auto cursor-pointer"
                                         title="Aşağı Taşı"
                                     ><ArrowDown size={10} /></button>
                                 </div>
                                 <button
                                     onClick={() => setDeleteConfirmKey(key)}
                                     className="size-8 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500/40 hover:text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                                     title="Anahtarı sil"
                                 >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                <AnimatePresence>
                    {showNewRow && (
                        <motion.div
                            key="new-row"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col sm:flex-row p-3 gap-2 border-b border-white/4 bg-[#6b5be6]/5"
                        >
                            <div className="flex items-start sm:w-[220px] shrink-0 gap-3">
                                <span className="block text-center text-[10px] font-mono text-white/15 pt-2 w-6">—</span>
                                <div className="relative flex-1">
                                    <input
                                        ref={newKeyRef}
                                        value={newKey}
                                        onChange={e => handleNewKeyChange(e.target.value)}
                                        placeholder="Anahtar adı"
                                        className="w-full bg-[#6b5be6]/5 border border-[#6b5be6]/30 focus:border-[#6b5be6]/70 rounded px-3 py-2 text-[12px] font-mono text-white/80 placeholder-white/30 focus:outline-none transition-all focus:shadow-[0_0_15px_rgba(107,91,230,0.15)]"
                                    />
                                    {suggestions.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full z-20 mt-2 bg-[#14141f] border border-[#6b5be6]/20 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                                            {suggestions.map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleSelectSuggestion(s)}
                                                    className="w-full px-4 py-2.5 text-left text-[11px] font-mono text-[#a78bfa] hover:bg-[#6b5be6]/20 hover:text-white transition-colors flex items-center justify-between cursor-pointer"
                                                >
                                                    <span className="font-bold">{s}</span>
                                                    {LABEL_DESCRIPTIONS[s] && (
                                                        <span className="text-[9px] text-white/30 ml-2 truncate max-w-[120px]">{LABEL_DESCRIPTIONS[s]}</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-1">
                                <input
                                    value={newValue}
                                    onChange={e => setNewValue(e.target.value)}
                                    placeholder="Değer girin..."
                                    className="w-full bg-[#6b5be6]/5 border border-[#6b5be6]/30 focus:border-[#6b5be6]/70 rounded-xl px-3 py-2 text-[13px] text-white/80 placeholder-white/30 focus:outline-none transition-all focus:shadow-[0_0_15px_rgba(107,91,230,0.15)]"
                                    onKeyDown={e => e.key === "Enter" && handleAddRow()}
                                />
                            </div>
                            
                            <div className="flex items-center gap-1.5 px-1 justify-end sm:justify-start">
                                <button
                                    onClick={handleAddRow}
                                    className="h-9 px-3 flex items-center justify-center rounded-xl bg-[#6b5be6] text-white font-bold text-[10px] hover:bg-[#5a4bd4] transition-all shadow-[0_0_15px_rgba(107,91,230,0.3)] shadow-[#6b5be6]/20 cursor-pointer"
                                     title="Ekle"
                                 >
                                     <Check size={14} className="mr-1" /> Ekle
                                 </button>
                                 <button
                                     onClick={() => { setShowNewRow(false); setNewKey(""); setNewValue(""); }}
                                     className="size-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5 cursor-pointer"
                                     title="İptal"
                                 >
                                    <X size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                </div>
            </div>


            {!showNewRow && (
                <div className="px-5 py-4 border-t border-white/4 shrink-0 bg-white/1">
                    <button
                        onClick={() => {
                            setShowNewRow(true);
                            setTimeout(() => newKeyRef.current?.focus(), 100);
                        }}
                        className="flex items-center gap-2 text-[11px] font-black text-white/30 hover:text-[#6b5be6] uppercase tracking-widest transition-colors cursor-pointer"
                    >
                        <Plus size={14} /> YENİ ETİKET EKLE
                    </button>
                </div>
            )}
        </div>
    );
}));
