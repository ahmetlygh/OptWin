"use client";

import { useOptWinStore } from "@/store/useOptWinStore";
import { useTranslation } from "@/i18n/useTranslation";
import { useModalPhase } from "@/hooks/useModalPhase";
import { XIcon, CheckIcon, BookOpenIcon, DownloadIcon, RepeatIcon, CopyIcon } from "../shared/Icons";
import { MonitorCog } from "lucide-react";

export function ScriptOverlay() {
    const {
        isScriptOverlayOpen, setScriptOverlayOpen,
        previewCode, showToast
    } = useOptWinStore();
    const { t } = useTranslation();
    const handleClose = () => setScriptOverlayOpen(false);
    const { isVisible, isMounted, phase, containerRef } = useModalPhase(isScriptOverlayOpen, handleClose);

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

    if (!isMounted) return null;

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl ${isVisible ? 'modal-backdrop-enter' : phase === 'exiting' ? 'modal-backdrop-exit' : ''}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-6xl bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl shadow-[var(--accent-color)]/10 relative flex flex-col md:flex-row h-[85vh] md:h-[80vh] ${isVisible ? 'modal-content-enter' : phase === 'exiting' ? 'modal-content-exit' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-20 size-8 flex items-center justify-center rounded-full bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] hover:bg-[var(--text-secondary)]/20 hover:text-[var(--text-primary)] hover:rotate-90 transition-all duration-200"
                >
                    <XIcon size={14} />
                </button>

                {/* Left Side: Instructions */}
                <div className="w-full md:w-[28%] bg-[var(--bg-color)] p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--border-color)] relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-color)]/5 to-transparent pointer-events-none"></div>
                    <div className="space-y-8 relative z-10">
                        <div className="animate-fade-in-up">
                            <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2 tracking-tight">{t["script.ready"]}</h2>
                            <div className="flex flex-wrap gap-2 text-xs font-semibold">
                                <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1 animate-pop-in" style={{ animationDelay: "0.1s" }}>
                                    <CheckIcon size={12} /> {t["script.safe"]}
                                </span>
                                <span className="bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-md border border-blue-500/20 flex items-center gap-1 animate-pop-in" style={{ animationDelay: "0.15s" }}>
                                    <RepeatIcon size={12} /> {t["script.reusable"]}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                            <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <BookOpenIcon size={18} className="text-[var(--accent-color)]" />
                                {t["script.howToUse"]}
                            </h3>
                            <ul className="space-y-4 text-[var(--text-secondary)] text-sm stagger-children">
                                <li className="flex gap-3">
                                    <span className="shrink-0 size-6 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold flex items-center justify-center">1</span>
                                    <span>{t["script.step1"]}</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="shrink-0 size-6 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold flex items-center justify-center">2</span>
                                    <span>{t["script.step2"]} <b className="text-[var(--text-primary)]">{t["script.runAsAdmin"]}</b>.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="shrink-0 size-6 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold flex items-center justify-center">3</span>
                                    <span>{t["script.step3"]}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[var(--border-color)] hidden md:block animate-fade-in-up relative z-10" style={{ animationDelay: "0.2s" }}>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDownload}
                                className="w-full flex items-center justify-center gap-2 h-12 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl shadow-[0_5px_15px_rgba(168,85,247,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(168,85,247,0.4)]"
                            >
                                <DownloadIcon size={18} /> {t["script.download"]}
                            </button>
                            <button
                                onClick={handleClose}
                                className="w-full flex items-center justify-center gap-2 h-12 bg-transparent border border-[var(--border-color)] hover:border-[var(--text-secondary)] text-[var(--text-primary)] font-bold rounded-xl transition-all duration-200"
                            >
                                {t["script.cancel"]}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Code Preview */}
                <div className="w-full md:w-[72%] p-4 md:p-6 flex flex-col h-full bg-[var(--card-bg)]">
                    <div className="flex items-center justify-between bg-[var(--bg-color)]/50 border border-[var(--border-color)] rounded-t-xl px-4 py-3 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                            <MonitorCog size={14} className="text-purple-500" /> OptWin.bat
                        </div>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] bg-[var(--text-secondary)]/10 hover:bg-[var(--text-secondary)]/20 px-3 py-1.5 rounded-lg border border-[var(--border-color)] transition-all duration-200 hover:scale-105"
                        >
                            <CopyIcon size={14} />
                            {t["script.copy"]}
                        </button>
                    </div>
                    <div className="flex-1 bg-[#1e1e2e] dark:bg-[#0a0a0f] border-x border-b border-[var(--border-color)] rounded-b-xl overflow-auto script-scrollbar">
                        <pre className="p-6 m-0">
                            <code className="text-purple-300 dark:text-purple-400 font-mono text-xs md:text-sm whitespace-pre selection:bg-[var(--accent-color)]/30">{previewCode}</code>
                        </pre>
                    </div>

                    {/* Mobile Actions */}
                    <div className="pt-4 flex md:hidden flex-row gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2 h-12 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl shadow-[0_5px_15px_rgba(168,85,247,0.3)] text-sm transition-all duration-200"
                        >
                            <DownloadIcon size={16} /> {t["script.download"]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
