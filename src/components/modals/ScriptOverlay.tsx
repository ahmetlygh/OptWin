"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { useState, useEffect, useCallback } from "react";
import { XIcon, DownloadIcon, CopyIcon, CheckIcon, RepeatIcon, ExternalLinkIcon, BookOpenIcon, ShieldIcon } from "../shared/Icons";

export function ScriptOverlay() {
    const {
        isScriptOverlayOpen, setScriptOverlayOpen,
        previewCode, showToast
    } = useOptWinStore();
    const { t } = useTranslation();
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

    const handleClose = useCallback(() => {
        setScriptOverlayOpen(false);
    }, [setScriptOverlayOpen]);

    // ESC to close
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        if (phase !== "closed") {
            document.addEventListener("keydown", onKeyDown);
            return () => document.removeEventListener("keydown", onKeyDown);
        }
    }, [phase, handleClose]);

    useEffect(() => {
        if (phase !== "closed") {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [phase]);

    const handleDownload = async () => {
        const blob = new Blob([previewCode], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "OptWin.bat";
        a.click();
        URL.revokeObjectURL(url);
        showToast(t["script.downloadToast"], "success");
        fetch("/api/stats?action=download", { method: "POST" }).catch(() => { });
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(previewCode);
        showToast(t["script.copiedToast"], "success");
    };

    if (phase === "closed") return null;
    const isVisible = phase === "open";

    return (
        <div
            className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl ${isVisible ? 'modal-backdrop-enter' : phase === 'exiting' ? 'modal-backdrop-exit' : ''}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-4xl bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[85vh] ${isVisible ? 'modal-content-enter' : phase === 'exiting' ? 'modal-content-exit' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left Side: Info & Actions */}
                <div className="w-full md:w-[35%] p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--border-color)] relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-[var(--accent-color)]/10 rounded-full blur-[60px] pointer-events-none"></div>

                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] hover:rotate-90 transition-all duration-200 md:hidden"
                    >
                        <XIcon size={16} />
                    </button>

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-12 rounded-xl bg-[var(--accent-color)]/20 text-[var(--accent-color)] flex items-center justify-center shadow-inner border border-[var(--accent-color)]/30">
                                <BookOpenIcon size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">{t["script.ready"]}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full font-bold flex items-center gap-1">
                                        <CheckIcon size={10} /> {t["script.safe"]}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full font-bold flex items-center gap-1">
                                        <RepeatIcon size={10} /> {t["script.reusable"]}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="space-y-3 mb-6">
                            <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">{t["script.howToUse"]}</h4>
                            <ol className="space-y-3 text-sm text-[var(--text-secondary)]">
                                <li className="flex items-start gap-2.5">
                                    <span className="text-[var(--accent-color)] font-black text-base leading-none mt-0.5 shrink-0">1.</span>
                                    <span>{t["script.step1"]}</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="text-[var(--accent-color)] font-black text-base leading-none mt-0.5 shrink-0">2.</span>
                                    <span>{t["script.step2"]} <b className="text-[var(--text-primary)]">Run as Administrator</b></span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="text-[var(--accent-color)] font-black text-base leading-none mt-0.5 shrink-0">3.</span>
                                    <span>{t["script.step3"]}</span>
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2.5 relative z-10">
                        <button
                            onClick={handleDownload}
                            className="w-full py-3.5 bg-gradient-to-r from-[var(--accent-color)] to-[#a855f7] text-white font-bold rounded-xl shadow-[0_10px_20px_rgba(108,92,231,0.2)] hover:shadow-[0_15px_30px_rgba(108,92,231,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2 transition-all duration-300"
                        >
                            <DownloadIcon size={18} /> {t["script.download"]}
                        </button>
                        <div className="flex gap-2.5">
                            <button
                                onClick={handleCopy}
                                className="flex-1 py-3 bg-transparent border-2 border-[var(--border-color)] hover:border-[var(--text-secondary)] text-[var(--text-primary)] font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                <CopyIcon size={16} /> {t["script.copy"]}
                            </button>
                            <button
                                onClick={handleClose}
                                className="flex-1 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold rounded-xl transition-all duration-300"
                            >
                                {t["script.cancel"]}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Code Preview */}
                <div className="w-full md:w-[65%] relative flex flex-col">
                    {/* Top bar with close & source link */}
                    <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                        <a
                            href="https://github.com/ahmetly"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--border-color)]/50 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors"
                        >
                            <ExternalLinkIcon size={12} /> {t["script.openSource"]}
                        </a>
                        <button
                            onClick={handleClose}
                            className="size-8 hidden md:flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] hover:rotate-90 transition-all duration-200"
                        >
                            <XIcon size={16} />
                        </button>
                    </div>

                    {/* Code */}
                    <pre className="flex-1 p-6 text-xs text-[var(--text-secondary)] font-mono leading-relaxed overflow-auto max-h-[50vh] md:max-h-none script-scrollbar bg-[var(--bg-color)]/50">
                        <code>{previewCode}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
}
