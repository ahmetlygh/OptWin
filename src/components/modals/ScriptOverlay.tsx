"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { TranslatableText } from "../shared/TranslatableText";
import { useEffect, useState } from "react";

export function ScriptOverlay() {
    const { isScriptOverlayOpen, setScriptOverlayOpen, selectedFeatures, showToast, previewCode } = useOptWinStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isScriptOverlayOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(previewCode);
        showToast("Script copied to clipboard!", "success");
    };

    const handleDownload = () => {
        // Basic download for Phase 1
        const blob = new Blob([previewCode], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `OptWin-${new Date().toISOString().slice(0, 10)}.bat`; // Default extension
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Download started!", "success");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-fade-in">
            <div
                className="w-full max-w-4xl bg-[#131121] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row h-[85vh] md:h-[75vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setScriptOverlayOpen(false)}
                    className="absolute top-4 right-4 z-20 size-8 flex items-center justify-center rounded-full bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>

                {/* Left Side: Instructions (takes 1/3 width on md) */}
                <div className="w-full md:w-[35%] bg-black/30 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--border-color)]">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Script Ready</h2>
                            <div className="flex flex-wrap gap-2 text-xs font-semibold">
                                <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1">
                                    <i className="fa-solid fa-check"></i> Safe
                                </span>
                                <span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md border border-blue-500/20 flex items-center gap-1">
                                    <i className="fa-solid fa-repeat"></i> Reusable
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <i className="fa-solid fa-book-open text-[var(--accent-color)]"></i>
                                <TranslatableText en="How to use" tr="Nasıl kullanılır" />
                            </h3>

                            <ul className="space-y-4 text-[var(--text-secondary)] text-sm">
                                <li className="flex gap-3">
                                    <span className="shrink-0 size-6 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold flex items-center justify-center">1</span>
                                    <span><TranslatableText en="Download the script using the button below." tr="Aşağıdaki butonu kullanarak betiği indirin." /></span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="shrink-0 size-6 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold flex items-center justify-center">2</span>
                                    <span><TranslatableText en="Right-click and select" tr="Sağ tıkla ve şunu seç:" /> <b>Run as Administrator / Powerhell</b>.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="shrink-0 size-6 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold flex items-center justify-center">3</span>
                                    <span><TranslatableText en="Wait for the terminal window to close." tr="Terminal penceresinin kapanmasını bekleyin." /></span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[var(--border-color)] hidden md:block">
                        <p className="text-xs text-[var(--text-secondary)] opacity-70 mb-4 whitespace-pre-wrap"><i className="fa-solid fa-info-circle mr-1"></i> Open source logic</p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDownload}
                                className="w-full flex items-center justify-center gap-2 h-12 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl transition-all shadow-lg"
                            >
                                <i className="fa-solid fa-download"></i> <TranslatableText en="Download" tr="İndir" noSpan />
                            </button>
                            <button
                                onClick={() => setScriptOverlayOpen(false)}
                                className="w-full flex items-center justify-center gap-2 h-12 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                            >
                                <TranslatableText en="Cancel" tr="İptal" noSpan />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Code Preview */}
                <div className="w-full md:w-[65%] p-4 md:p-6 flex flex-col h-full bg-[#0a0a0f]">
                    <div className="flex items-center justify-between bg-black/50 border border-white/5 rounded-t-xl px-4 py-3">
                        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                            <i className="fa-brands fa-microsoft text-blue-400"></i> OptWin.bat
                        </div>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors border border-white/5"
                        >
                            <i className="fa-solid fa-copy"></i>
                            <TranslatableText en="Copy" tr="Kopyala" noSpan />
                        </button>
                    </div>
                    <div className="flex-1 bg-black/80 border-x border-b border-white/5 rounded-b-xl overflow-hidden relative">
                        <textarea
                            readOnly
                            value={previewCode}
                            className="absolute inset-0 w-full h-full p-6 bg-transparent text-[#a2e88a] font-mono text-xs md:text-sm resize-none focus:outline-none selection:bg-[var(--accent-color)]/30 custom-scrollbar"
                        />
                    </div>

                    {/* Mobile Actions */}
                    <div className="pt-4 flex md:hidden flex-row gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2 h-12 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl transition-all shadow-lg text-sm"
                        >
                            <i className="fa-solid fa-download"></i> <TranslatableText en="Download" tr="İndir" noSpan />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
