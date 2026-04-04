import React, { useState } from "react";
import { Plus, Trash2, Pencil, MonitorPlay, Undo2, Info } from "lucide-react";
import { MergedItem, PreviewLine, ExtraLine, getLineClass } from "./ScriptSettingsTypes";

interface TerminalPreviewProps {
    mergedItems: MergedItem[];
    activeLang: string;
    lineOverrides: Record<number, string>;
    setLineOverrides: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    deletedPreviewLines: number[];
    setDeletedPreviewLines: React.Dispatch<React.SetStateAction<number[]>>;
    currentLabels: Record<string, string>;
    handleValueChange: (k: string, v: string) => void;
    editingLineIdx: number | null;
    setEditingLineIdx: (n: number | null) => void;
    editingLineKey: string | null;
    setEditingLineKey: (s: string | null) => void;
    extraLines: ExtraLine[];
    setExtraLines: React.Dispatch<React.SetStateAction<ExtraLine[]>>;
    resolveDisplay: (t: string) => string;
    getDisplayText: (l: PreviewLine, i: number) => string;
}

export const TerminalPreview = React.memo(({
    mergedItems,
    activeLang,
    lineOverrides,
    setLineOverrides,
    deletedPreviewLines,
    setDeletedPreviewLines,
    currentLabels,
    handleValueChange,
    editingLineIdx,
    setEditingLineIdx,
    editingLineKey,
    setEditingLineKey,
    extraLines,
    setExtraLines,
    resolveDisplay,
    getDisplayText
}: TerminalPreviewProps) => {

    const [showToolbarHint, setShowToolbarHint] = useState(false);

    // Advanced Syntax Highlighting
    const renderSyntax = (text: string) => {
        if (!text) return "\u00A0";
        if (text.trim().startsWith("#")) return <span className="text-emerald-400/60">{text}</span>;
        
        // Very basic simple tokenizer for strings and keywords
        let parts = [];
        let remaining = text;
        
        // Find Write-Host
        if (remaining.includes("Write-Host")) {
            const split = remaining.split(/Write-Host/);
            parts.push(<span key={parts.length}>{split[0]}</span>);
            parts.push(<span key={parts.length} className="text-[#a78bfa] font-bold">Write-Host</span>);
            remaining = split[1];
        }

        // Highlight strings
        const stringRegex = /"([^"]*)"/g;
        let lastIdx = 0;
        let match;
        const stringParts = [];
        while ((match = stringRegex.exec(remaining)) !== null) {
            stringParts.push(<span key={stringParts.length}>{remaining.substring(lastIdx, match.index)}</span>);
            // Highlight variables inside string
            const strContent = match[1];
            const varRegex = /\$(\w+)/g;
            let strRemaining = strContent;
            let strMatch;
            let strLast = 0;
            const innerParts = [];
            while ((strMatch = varRegex.exec(strContent)) !== null) {
                innerParts.push(<span key={innerParts.length} className="text-amber-200/80">{strContent.substring(strLast, strMatch.index)}</span>);
                innerParts.push(<span key={innerParts.length} className="text-cyan-300 font-bold">{strMatch[0]}</span>);
                strLast = strMatch.index + strMatch[0].length;
            }
            innerParts.push(<span key={innerParts.length} className="text-amber-200/80">{strContent.substring(strLast)}</span>);

            stringParts.push(<span key={stringParts.length} className="text-amber-200">"{innerParts}"</span>);
            lastIdx = match.index + match[0].length;
        }
        stringParts.push(<span key={stringParts.length}>{remaining.substring(lastIdx)}</span>);
        parts.push(<span key={parts.length}>{stringParts}</span>);

        // Variables outside strings
        return parts.map((p, i) => <React.Fragment key={i}>{p}</React.Fragment>);
    };

    return (
        <div className="rounded-2xl border border-white/4 bg-white/15 backdrop-blur-md overflow-hidden flex flex-col h-full shadow-2xl">
            {/* Terminal header */}
            <div className="px-5 py-3 border-b border-white/4 flex items-center justify-between shrink-0 bg-[#0d0d14]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer z-10" title="Önizlemeyi kontrol et">
                        <button className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 focus:outline-none" title="Silinen satırları temizle" onClick={() => setDeletedPreviewLines([])}></button>
                        <button className="w-3 h-3 rounded-full bg-yellow-500 focus:outline-none"></button>
                        <button className="w-3 h-3 rounded-full bg-emerald-500 focus:outline-none"></button>
                    </div>
                    <div className="flex items-center gap-2">
                        <MonitorPlay size={14} className="text-emerald-400" />
                        <span className="text-[11px] font-mono font-bold text-white/50 tracking-wider">OptWin-Pv-{activeLang.toUpperCase()}.bat</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {deletedPreviewLines.length > 0 && (
                        <button 
                            onClick={() => setDeletedPreviewLines(prev => prev.slice(0, -1))}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded transition-colors uppercase tracking-widest"
                            title="Son silinen satırı geri getir"
                        >
                            <Undo2 size={11} /> Geri Al ({deletedPreviewLines.length})
                        </button>
                    )}
                    <span className="text-[10px] text-white/20 font-mono font-bold">{mergedItems.length} satır</span>
                </div>
            </div>

            {/* Terminal body */}
            <div className="flex-1 bg-[#08080e] overflow-y-auto optwin-pro-scroll min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent' }}>
                <div className="py-4">
                    {mergedItems.map((item, mIdx) => {
                        const lineNum = mIdx + 1;

                        // === EXTRA LINE ===
                        if (item.type === 'extra') {
                            const ei = item.extraIdx;
                            const isEditingExtra = editingLineIdx === -(ei + 1);
                            const displayText = resolveDisplay(item.text);

                            const keyMatch = item.text.match(/<([a-zA-Z_][a-zA-Z0-9_]*)>/);
                            const extraLabel = keyMatch ? keyMatch[1] : null;

                            if (isEditingExtra) {
                                return (
                                    <div key={`extra-${ei}`} className="flex items-center gap-0 px-3 py-1 bg-amber-500/8" data-extra-row={ei}>
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.pos}
                                            onChange={e => {
                                                const num = parseInt(e.target.value);
                                                if (!isNaN(num) && num >= 1) {
                                                    setExtraLines(prev => { const n = [...prev]; n[ei] = { ...n[ei], pos: num }; return n; });
                                                }
                                            }}
                                            onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                                            className="w-10 text-right text-[11px] font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded px-1 py-0.5 shrink-0 focus:outline-none focus:border-amber-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            title="Satır konumunu değiştir"
                                        />
                                        <span className="w-px h-5 bg-amber-500/20 mx-2.5 shrink-0" />
                                        {extraLabel ? (
                                            <span className="text-[10px] font-mono text-amber-500/60 w-[90px] text-right pr-2 shrink-0 truncate" title={extraLabel}>{extraLabel}</span>
                                        ) : (
                                            <span className="w-[90px] shrink-0" />
                                        )}
                                        <input
                                            autoFocus
                                            value={item.text}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setExtraLines(prev => { const n = [...prev]; n[ei] = { ...n[ei], text: val }; return n; });
                                            }}
                                            onKeyDown={e => {
                                                if (e.key === "Escape" || e.key === "Enter") setEditingLineIdx(null);
                                            }}
                                            onBlur={e => {
                                                const row = (e.target as HTMLElement).closest('[data-extra-row]');
                                                if (row?.contains(e.relatedTarget as Node)) return;
                                                setEditingLineIdx(null);
                                            }}
                                            className="flex-1 bg-amber-500/8 border border-amber-500/30 rounded px-3 py-1.5 text-[12px] font-mono text-amber-200 focus:outline-none focus:border-amber-500 transition-all mr-3"
                                            placeholder='Satır içeriği... (<version> gibi placeholder kullanabilirsiniz)'
                                        />
                                        <button
                                            onMouseDown={e => { e.preventDefault(); setExtraLines(prev => prev.filter((_, i) => i !== ei)); setEditingLineIdx(null); }}
                                            className="size-7 flex items-center justify-center rounded bg-red-500/10 text-red-400 hover:text-white hover:bg-red-500 transition-all shrink-0"
                                            title="Satırı sil"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={`extra-${ei}`}
                                    className="flex items-start gap-0 px-3 py-0.5 group cursor-pointer hover:bg-white/3"
                                    onClick={() => { setEditingLineIdx(-(ei + 1)); setEditingLineKey(null); }}
                                >
                                    <span className="w-10 text-right text-[11px] font-mono font-bold text-white/15 shrink-0 select-none pt-[3px]">{lineNum}</span>
                                    <span className="w-px h-5 bg-white/6 mx-2.5 shrink-0 mt-[2px]" />
                                    {extraLabel ? (
                                        <span className="text-[10px] font-mono text-white/15 group-hover:text-white/30 w-[90px] text-right pr-2 shrink-0 truncate pt-[3px] transition-colors" title={extraLabel}>{extraLabel}</span>
                                    ) : (
                                        <span className="w-[90px] shrink-0" />
                                    )}
                                    <code className={`text-[12px] font-mono whitespace-pre leading-relaxed ${getLineClass(displayText)} group-hover:brightness-125 transition-all flex-1`}>
                                        {renderSyntax(displayText)}
                                    </code>
                                    <Pencil size={10} className="text-white/0 group-hover:text-white/30 transition-colors mt-[5px] ml-2 shrink-0" />
                                </div>
                            );
                        }

                        // === PREVIEW LINE ===
                        const { line } = item;
                        const idx = item.previewIdx;
                        const isEditingKey = editingLineKey === line.key && !!line.key;
                        const isEditingIdx = editingLineIdx === idx && !line.key;
                        const displayText = getDisplayText(line, idx);

                        if (isEditingKey && line.key) {
                            return (
                                <div key={`pv-${idx}-${line.key}`} className="flex items-center gap-0 px-3 py-1 bg-[#6b5be6]/8">
                                    <span className="w-10 text-right text-[11px] font-mono font-bold text-[#6b5be6] shrink-0 select-none">{lineNum}</span>
                                    <span className="w-px h-5 bg-[#6b5be6]/30 mx-2.5 shrink-0" />
                                    <span className="text-[10px] font-mono font-bold text-[#6b5be6]/70 w-[90px] text-right pr-2 shrink-0 truncate" title={line.key}>{line.key}</span>
                                    <div className="flex-1 flex items-center gap-2 mr-3">
                                        <input
                                            autoFocus={!line.valueKey}
                                            value={currentLabels[line.key] || ""}
                                            onChange={e => handleValueChange(line.key!, e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === "Escape") setEditingLineKey(null);
                                            }}
                                            onBlur={() => { if (!line.valueKey) setEditingLineKey(null); }}
                                            className={`bg-[#6b5be6]/10 border border-[#6b5be6]/40 rounded px-3 py-1.5 text-[12px] font-mono text-white focus:outline-none focus:border-[#6b5be6] transition-all ${line.valueKey ? "w-1/2" : "flex-1"}`}
                                            placeholder="Etiket..."
                                        />
                                        {line.valueKey && (
                                            <>
                                                <span className="text-[12px] text-white/30 font-mono font-bold">:</span>
                                                <input
                                                    autoFocus
                                                    value={currentLabels[line.valueKey] || ""}
                                                    onChange={e => handleValueChange(line.valueKey!, e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === "Escape") setEditingLineKey(null);
                                                    }}
                                                    onBlur={() => setEditingLineKey(null)}
                                                    className="flex-1 bg-[#6b5be6]/10 border border-[#6b5be6]/40 rounded px-3 py-1.5 text-[12px] font-mono text-white focus:outline-none focus:border-[#6b5be6] transition-all"
                                                    placeholder="Değer..."
                                                />
                                            </>
                                        )}
                                    </div>
                                    <button
                                        onMouseDown={e => { e.preventDefault(); setDeletedPreviewLines(prev => [...prev, idx]); setEditingLineKey(null); }}
                                        className="size-7 flex items-center justify-center rounded bg-red-500/10 text-red-400 hover:text-white hover:bg-red-500 transition-all shrink-0"
                                        title="Satırı sil"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            );
                        }

                        if (isEditingIdx) {
                            return (
                                <div key={`pv-${idx}-static-edit`} className="flex items-center gap-0 px-3 py-1 bg-amber-500/8">
                                    <span className="w-10 text-right text-[11px] font-mono font-bold text-amber-500 shrink-0 select-none">{lineNum}</span>
                                    <span className="w-px h-5 bg-amber-500/30 mx-2.5 shrink-0" />
                                    <span className="w-[90px] shrink-0" />
                                    <input
                                        autoFocus
                                        value={lineOverrides[idx] ?? line.text}
                                        onChange={e => setLineOverrides(prev => ({ ...prev, [idx]: e.target.value }))}
                                        onKeyDown={e => {
                                            if (e.key === "Escape") setEditingLineIdx(null);
                                            if (e.key === "Enter") setEditingLineIdx(null);
                                        }}
                                        onBlur={() => setEditingLineIdx(null)}
                                        className="flex-1 bg-amber-500/10 border border-amber-500/40 rounded px-3 py-1.5 text-[12px] font-mono text-white focus:outline-none focus:border-amber-500 transition-all mr-3"
                                        placeholder="Satır içeriği..."
                                    />
                                    <button
                                        onMouseDown={e => { e.preventDefault(); setDeletedPreviewLines(prev => [...prev, idx]); setEditingLineIdx(null); }}
                                        className="size-7 flex items-center justify-center rounded bg-red-500/10 text-red-400 hover:text-white hover:bg-red-500 transition-all shrink-0"
                                        title="Satırı sil"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={`pv-${idx}-${line.key || 'static'}`}
                                className="flex items-start gap-0 px-3 py-0.5 group cursor-pointer hover:bg-white/3"
                                onClick={() => {
                                    if (line.key) {
                                        setEditingLineKey(line.key);
                                        setEditingLineIdx(null);
                                    } else {
                                        setEditingLineIdx(idx);
                                        setEditingLineKey(null);
                                    }
                                }}
                            >
                                <span className="w-10 text-right text-[11px] font-mono font-bold text-white/15 shrink-0 select-none pt-[3px]">{lineNum}</span>
                                <span className="w-px h-5 bg-white/6 mx-2.5 shrink-0 mt-[2px]" />
                                {line.key ? (
                                    <span className="text-[10px] font-mono text-white/15 group-hover:text-white/30 w-[90px] text-right pr-2 shrink-0 truncate pt-[3px] transition-colors" title={line.key}>{line.key}</span>
                                ) : (
                                    <span className="w-[90px] shrink-0" />
                                )}
                                <code className={`text-[12px] font-mono whitespace-pre leading-relaxed ${getLineClass(displayText)} group-hover:brightness-125 transition-all flex-1`}>
                                    {renderSyntax(displayText)}
                                </code>
                                <Pencil size={10} className="text-white/0 group-hover:text-white/30 transition-colors mt-[5px] ml-2 shrink-0" />
                                <button
                                    onClick={e => { e.stopPropagation(); setDeletedPreviewLines(prev => [...prev, idx]); setEditingLineKey(null); setEditingLineIdx(null); }}
                                    className="size-5 flex items-center justify-center rounded text-white/0 group-hover:text-red-400/40 hover:text-white! hover:bg-red-500! transition-all shrink-0 ml-1.5 mt-0.5"
                                    title="Satırı sil"
                                >
                                    <Trash2 size={10} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Terminal footer */}
            <div className="px-5 py-3 border-t border-white/4 bg-[#0d0d14] flex items-center justify-between shrink-0 relative overflow-visible">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono font-bold text-white/20">{mergedItems.length} satır</span>
                    
                    <div className="relative" onMouseEnter={() => setShowToolbarHint(true)} onMouseLeave={() => setShowToolbarHint(false)}>
                        <button
                            onClick={() => {
                                const newPos = mergedItems.length + 1;
                                setExtraLines(prev => [...prev, { pos: newPos, text: "", extraIdx: extraLines.length }]);
                                setTimeout(() => setEditingLineIdx(-(extraLines.length + 1)), 50);
                            }}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400/60 hover:text-emerald-400 uppercase tracking-widest transition-colors peer"
                        >
                            <Plus size={14} /> Satır Ekle
                        </button>
                        
                        {/* Tooltip Popup */}
                        {showToolbarHint && (
                            <div className="absolute bottom-full left-0 mb-3 bg-[#6b5be6]/10 backdrop-blur-md border border-[#6b5be6]/30 text-white/80 text-[10px] font-mono px-3 py-2 rounded-lg whitespace-nowrap shadow-[0_0_20px_rgba(107,91,230,0.3)] z-50 animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2">
                                <Info size={12} className="text-[#6b5be6]" />
                                Yeni bir özel PowerShell satırı ekler.<br/> Değişken kullanmak için <span className="text-amber-400 bg-amber-400/10 px-1 rounded">&lt;version&gt;</span> formatını kullanın.
                            </div>
                        )}
                    </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-white/20">UTF-8 · Batch + PowerShell</span>
            </div>
        </div>
    );
});
