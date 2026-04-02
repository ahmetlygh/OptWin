import React, { useRef, useLayoutEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Check, X, ArrowUp, ArrowDown } from "lucide-react";
import { LABEL_DESCRIPTIONS } from "./ScriptSettingsTypes";

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

export const LabelsTable = React.memo(({
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
}: LabelsTableProps) => {
    const newKeyRef = useRef<HTMLInputElement>(null);
    const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

    const [searchQuery, setSearchQuery] = useState("");
    const [showMissingOnly, setShowMissingOnly] = useState(false);

    useLayoutEffect(() => {
        Object.values(textareaRefs.current).forEach(t => {
            if (t) {
                t.style.height = "auto";
                t.style.height = t.scrollHeight + "px";
            }
        });
    }, [currentLabels]);

    const filteredKeys = keys.filter(key => {
        if (searchQuery) {
            const lowQ = searchQuery.toLowerCase();
            const val = currentLabels[key] || "";
            if (!key.toLowerCase().includes(lowQ) && !val.toLowerCase().includes(lowQ)) return false;
        }
        if (showMissingOnly && activeLang !== "en") {
            const translated = currentLabels[key];
            const originalEN = originalLabels["en"]?.[key];
            const isMissing = (!translated || translated.trim() === "" || translated === originalEN);
            if (!isMissing) return false;
        }
        return true;
    });

    return (
        <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] backdrop-blur-md overflow-hidden flex flex-col h-full shadow-2xl">
            <div className="px-5 py-3 border-b border-white/[0.04] flex flex-col xl:flex-row xl:items-center justify-between shrink-0 gap-3">
                <div className="flex items-center gap-3">
                    <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] hidden sm:block">ANAHTAR-DEĞER</h3>
                    <span className="text-[10px] bg-white/[0.05] border border-white/[0.05] px-2 py-0.5 rounded text-white/40 font-mono font-bold tracking-wider">{filteredKeys.length} / {keys.length} etiket</span>
                </div>
                <div className="flex items-center gap-2">
                    {activeLang !== "en" && (
                        <button 
                            onClick={() => setShowMissingOnly(!showMissingOnly)}
                            className={`h-8 px-3 flex items-center justify-center rounded-lg text-[10px] font-bold uppercase transition-all bg-opacity-20 border shrink-0 ${showMissingOnly ? "bg-amber-500 border-amber-500/40 text-amber-500" : "bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/[0.06]"}`}
                        >
                            EKSİKLERİ FİLTRELE
                        </button>
                    )}
                    <input 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Kelime ara..."
                        className="h-8 w-full sm:w-auto min-w-[150px] bg-black/20 border border-white/[0.06] hover:border-white/[0.12] focus:border-[#6b5be6]/50 rounded-lg px-3 text-[11px] text-white/80 placeholder-white/20 focus:outline-none transition-colors"
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto optwin-pro-scroll min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(107, 91, 230, 0.5) rgba(0, 0, 0, 0.2)' }}>
                {filteredKeys.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center opacity-30">
                        <span className="text-[11px] font-black tracking-widest uppercase">Sonuç Bulunamadı</span>
                    </div>
                ) : filteredKeys.map((key, i) => {
                    const original = originalLabels[activeLang]?.[key];
                    const current = currentLabels[key];
                    const changed = original !== undefined && original !== current;

                    return (
                        <div key={key} className={`flex flex-col sm:flex-row p-3 gap-2 border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors group/row ${changed ? "bg-[#6b5be6]/[0.05]" : ""}`}>
                            
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
                                    className="w-full bg-white/[0.02] border border-white/[0.04] p-2 hover:border-[#6b5be6]/30 hover:bg-[#6b5be6]/[0.02] focus:border-[#6b5be6]/50 focus:bg-[#6b5be6]/5 rounded-xl text-[13px] text-white/80 placeholder-white/20 focus:outline-none transition-all resize-none shadow-sm pb-2.5"
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
                                        className="size-4 flex items-center justify-center rounded bg-white/[0.05] hover:bg-white/[0.1] text-white/40 hover:text-white transition-colors disabled:opacity-0 disabled:cursor-auto"
                                        title="Yukarı Taşı"
                                    ><ArrowUp size={10} /></button>
                                    <button 
                                        onClick={() => handleMoveDown(key)}
                                        disabled={i === filteredKeys.length - 1 || searchQuery !== "" || showMissingOnly}
                                        className="size-4 flex items-center justify-center rounded bg-white/[0.05] hover:bg-white/[0.1] text-white/40 hover:text-white transition-colors disabled:opacity-0 disabled:cursor-auto"
                                        title="Aşağı Taşı"
                                    ><ArrowDown size={10} /></button>
                                </div>
                                <button
                                    onClick={() => setDeleteConfirmKey(key)}
                                    className="size-8 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500/40 hover:text-red-400 hover:bg-red-500/20 transition-all"
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
                            className="flex flex-col sm:flex-row p-3 gap-2 border-b border-white/[0.04] bg-[#6b5be6]/[0.05]"
                        >
                            <div className="flex items-start sm:w-[220px] shrink-0 gap-3">
                                <span className="block text-center text-[10px] font-mono text-white/15 pt-2 w-6">—</span>
                                <div className="relative flex-1">
                                    <input
                                        ref={newKeyRef}
                                        value={newKey}
                                        onChange={e => handleNewKeyChange(e.target.value)}
                                        placeholder="Anahtar adı"
                                        className="w-full bg-[#6b5be6]/[0.05] border border-[#6b5be6]/30 focus:border-[#6b5be6]/70 rounded px-3 py-2 text-[12px] font-mono text-white/80 placeholder-white/30 focus:outline-none transition-all focus:shadow-[0_0_15px_rgba(107,91,230,0.15)]"
                                    />
                                    {suggestions.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full z-20 mt-2 bg-[#14141f] border border-[#6b5be6]/20 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                                            {suggestions.map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleSelectSuggestion(s)}
                                                    className="w-full px-4 py-2.5 text-left text-[11px] font-mono text-white/60 text-[#a78bfa] hover:bg-[#6b5be6]/20 hover:text-white transition-colors flex items-center justify-between"
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
                                    className="w-full bg-[#6b5be6]/[0.05] border border-[#6b5be6]/30 focus:border-[#6b5be6]/70 rounded-xl px-3 py-2 text-[13px] text-white/80 placeholder-white/30 focus:outline-none transition-all focus:shadow-[0_0_15px_rgba(107,91,230,0.15)]"
                                    onKeyDown={e => e.key === "Enter" && handleAddRow()}
                                />
                            </div>
                            
                            <div className="flex items-center gap-1.5 px-1 justify-end sm:justify-start">
                                <button
                                    onClick={handleAddRow}
                                    className="h-9 px-3 flex items-center justify-center rounded-xl bg-[#6b5be6] text-white font-bold text-[10px] hover:bg-[#5a4bd4] transition-all shadow-[0_0_15px_rgba(107,91,230,0.3)] shadow-[#6b5be6]/20"
                                    title="Ekle"
                                >
                                    <Check size={14} className="mr-1" /> Ekle
                                </button>
                                <button
                                    onClick={() => { setShowNewRow(false); setNewKey(""); setNewValue(""); }}
                                    className="size-9 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/40 hover:text-white transition-all border border-white/[0.05]"
                                    title="İptal"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="px-5 py-4 border-t border-white/[0.04] shrink-0 bg-white/[0.01]">
                <button
                    onClick={() => {
                        setShowNewRow(true);
                        setTimeout(() => newKeyRef.current?.focus(), 100);
                    }}
                    className="flex items-center gap-2 text-[11px] font-black text-white/30 hover:text-[#6b5be6] uppercase tracking-[0.1em] transition-colors"
                >
                    <Plus size={14} /> YENİ ETİKET EKLE
                </button>
            </div>
        </div>
    );
});
