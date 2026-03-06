"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { TranslatableText } from "../shared/TranslatableText";
import { useState, useEffect, useCallback } from "react";
import { XIcon, CheckIcon, BookOpenIcon, DownloadIcon, RepeatIcon, CopyIcon } from "../shared/Icons";
import { MonitorCog } from "lucide-react";

export function ScriptOverlay() {
    const { isScriptOverlayOpen, setScriptOverlayOpen, showToast, previewCode } = useOptWinStore();
    const [phase, setPhase] = useState<"closed" | "entering" | "open" | "exiting">("closed");

    useEffect(() => {
        if (isScriptOverlayOpen && phase === "closed") {
            setPhase("entering");
            requestAnimationFrame(() => setPhase("open"));
        } else if (!isScriptOverlayOpen && (phase === "open" || phase === "entering")) {
            setPhase("exiting");
            const timer = setTimeout(() => setPhase("closed"), 300);
            return () => clearTimeout(timer);
        }
    }, [isScriptOverlayOpen]);

    // Lock body scroll when open
    useEffect(() => {
        if (phase !== "closed") {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [phase]);

    // ESC key to close
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") setScriptOverlayOpen(false);
    }, [setScriptOverlayOpen]);

    useEffect(() => {
        if (phase !== "closed") {
            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [phase, handleKeyDown]);

    if (phase === "closed") return null;
    const isVisible = phase === "open";

    const handleCopy = () => {
        navigator.clipboard.writeText(previewCode);
        showToast("Script copied to clipboard!", "success");
    };

    const handleDownload = () => {
        const blob = new Blob([previewCode], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `OptWin-${new Date().toISOString().slice(0, 10)}.bat`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Download started!", "success");
    };

    return (
        <div
            className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl ${isVisible ? 'modal-backdrop-enter' : phase === 'exiting' ? 'modal-backdrop-exit' : ''}`}
            onClick={() => setScriptOverlayOpen(false)}
        >
            <div
                className={`w-full max-w-6xl bg-[#131121] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl shadow-[var(--accent-color)]/10 relative flex flex-col md:flex-row h-[85vh] md:h-[80vh] ${isVisible ? 'modal-content-enter' : phase === 'exiting' ? 'modal-content-exit' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setScriptOverlayOpen(false)}
                    className="absolute top-4 right-4 z-20 size-8 flex items-center justify-center rounded-full bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:text-white hover:rotate-90 transition-all duration-200"
                >
                    <XIcon size={14} />
                </button>

                {/* Left Side: Instructions */}
                <div className="w-full md:w-[28%] bg-gradient-to-b from-black/40 to-black/20 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--border-color)]">
                    <div className="space-y-8">
                        <div className="animate-fade-in-up">
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Script Ready</h2>
                            <div className="flex flex-wrap gap-2 text-xs font-semibold">
                                <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1 animate-pop-in" style={{ animationDelay: "0.1s" }}>
                                    <CheckIcon size={12} /> Safe
                                </span>
                                <span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md border border-blue-500/20 flex items-center gap-1 animate-pop-in" style={{ animationDelay: "0.15s" }}>
                                    <RepeatIcon size={12} /> Reusable
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <BookOpenIcon size={18} className="text-[var(--accent-color)]" />
                                <TranslatableText en="How to use" tr="Nasıl kullanılır" />
                            </h3>
                            <ul className="space-y-4 text-[var(--text-secondary)] text-sm stagger-children">
                                <li className="flex gap-3">
                                    <span className="shrink-0 size-6 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold flex items-center justify-center">1</span>
                                    <span><TranslatableText en="Download the script using the button below." tr="Aşağıdaki butonu kullanarak betiği indirin." /></span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="shrink-0 size-6 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold flex items-center justify-center">2</span>
                                    <span><TranslatableText en="Right-click and select" tr="Sağ tıkla ve şunu seç:" /> <b>Run as Administrator / PowerShell</b>.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="shrink-0 size-6 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold flex items-center justify-center">3</span>
                                    <span><TranslatableText en="Wait for the terminal window to close." tr="Terminal penceresinin kapanmasını bekleyin." /></span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[var(--border-color)] hidden md:block animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                        <p className="text-xs text-[var(--text-secondary)] opacity-70 mb-4 whitespace-pre-wrap flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                            Open source logic
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDownload}
                                className="w-full flex items-center justify-center gap-2 h-12 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(107,91,230,0.4)]"
                            >
                                <DownloadIcon size={18} /> <TranslatableText en="Download" tr="İndir" noSpan />
                            </button>
                            <button
                                onClick={() => setScriptOverlayOpen(false)}
                                className="w-full flex items-center justify-center gap-2 h-12 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all duration-200"
                            >
                                <TranslatableText en="Cancel" tr="İptal" noSpan />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Code Preview */}
                <div className="w-full md:w-[72%] p-4 md:p-6 flex flex-col h-full bg-[#0a0a0f]">
                    <div className="flex items-center justify-between bg-black/50 border border-white/5 rounded-t-xl px-4 py-3 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                            <MonitorCog size={14} className="text-blue-400" /> OptWin.bat
                        </div>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/5 transition-all duration-200 hover:scale-105"
                        >
                            <CopyIcon size={14} />
                            <TranslatableText en="Copy" tr="Kopyala" noSpan />
                        </button>
                    </div>
                    <div className="flex-1 bg-black/80 border-x border-b border-white/5 rounded-b-xl overflow-hidden relative">
                        <textarea
                            readOnly
                            value={previewCode}
                            className="absolute inset-0 w-full h-full p-6 bg-transparent text-[#a2e88a] font-mono text-xs md:text-sm resize-none focus:outline-none selection:bg-[var(--accent-color)]/30"
                        />
                    </div>

                    {/* Mobile Actions */}
                    <div className="pt-4 flex md:hidden flex-row gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2 h-12 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl shadow-lg text-sm transition-all duration-200"
                        >
                            <DownloadIcon size={16} /> <TranslatableText en="Download" tr="İndir" noSpan />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
